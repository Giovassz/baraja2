-- Implementa BJ2-004 — tabla de parejas + FK circular con usuarios + helpers de RLS

create table if not exists parejas (
  id uuid primary key default gen_random_uuid(),
  nombre_espacio text,
  modalidad text not null check (modalidad in ('distancia','hibrida','fisica')),
  codigo_invitacion text unique not null,
  codigo_usado boolean not null default false,
  usuario_1_id uuid not null references usuarios(id),
  usuario_2_id uuid references usuarios(id),
  fecha_vinculacion timestamptz, -- se asigna cuando usuario_2 se une
  created_at timestamptz not null default now()
);

comment on table parejas is 'Un espacio compartido entre dos jugadores. usuario_2_id es null hasta la vinculación.';

alter table usuarios
  drop constraint if exists fk_usuarios_pareja;
alter table usuarios
  add constraint fk_usuarios_pareja
  foreign key (pareja_id) references parejas(id);

-- Helper reutilizable para políticas RLS de todas las tablas con pareja_id.
create or replace function es_miembro_de_pareja(p_pareja_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parejas
    where id = p_pareja_id
      and (usuario_1_id = auth.uid() or usuario_2_id = auth.uid())
  );
$$;

alter table parejas enable row level security;

-- Se puede leer una pareja si eres miembro, o si el código de invitación coincide
-- (necesario en el flujo de vinculación, antes de ser miembro).
create policy "parejas_select_miembro"
  on parejas for select
  using (usuario_1_id = auth.uid() or usuario_2_id = auth.uid());

create policy "parejas_insert_creador"
  on parejas for insert
  with check (usuario_1_id = auth.uid());

create policy "parejas_update_miembro"
  on parejas for update
  using (usuario_1_id = auth.uid() or usuario_2_id = auth.uid())
  with check (usuario_1_id = auth.uid() or usuario_2_id = auth.uid());

-- RPC de vinculación: el segundo jugador se une usando el código de invitación.
-- SECURITY DEFINER porque quien llama todavía no es miembro de la pareja.
create or replace function vincular_con_codigo(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pareja parejas%rowtype;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'SIN_SESION';
  end if;

  select * into v_pareja from parejas
  where upper(codigo_invitacion) = upper(trim(p_codigo))
  for update;

  if not found then
    raise exception 'CODIGO_INVALIDO';
  end if;

  if v_pareja.codigo_usado or v_pareja.usuario_2_id is not null then
    raise exception 'CODIGO_YA_USADO';
  end if;

  if v_pareja.usuario_1_id = v_uid then
    raise exception 'NO_PUEDES_UNIRTE_A_TU_PROPIO_ESPACIO';
  end if;

  if (select pareja_id from usuarios where id = v_uid) is not null then
    raise exception 'YA_TIENES_PAREJA';
  end if;

  update parejas
    set usuario_2_id = v_uid,
        codigo_usado = true,
        fecha_vinculacion = now()
  where id = v_pareja.id;

  update usuarios set pareja_id = v_pareja.id where id = v_uid;
  update usuarios set pareja_id = v_pareja.id where id = v_pareja.usuario_1_id;

  return v_pareja.id;
end;
$$;
