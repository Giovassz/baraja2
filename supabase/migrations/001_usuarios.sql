-- Implementa BJ2-004 — tabla de usuarios
-- La FK usuarios.pareja_id -> parejas(id) se agrega en 002 (dependencia circular).

create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  avatar_id text, -- referencia al catálogo estático de avatares (lib/reglas/avatares.ts)
  confirmo_mayor_edad boolean not null default false,
  pareja_id uuid,
  modo_spicy_activo boolean not null default false, -- preferencia de UI (supuesto S3/4.7)
  created_at timestamptz not null default now()
);

comment on table usuarios is 'Perfil de cada jugador de Baraja2. El id coincide con auth.users.';

-- Crea automáticamente la fila de usuarios al registrarse en Supabase Auth.
create or replace function crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, confirmo_mayor_edad)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', 'Jugador'),
    coalesce((new.raw_user_meta_data->>'confirmo_mayor_edad')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario_auth on auth.users;
create trigger al_crear_usuario_auth
  after insert on auth.users
  for each row execute function crear_perfil_usuario();

-- Row Level Security
alter table usuarios enable row level security;

-- Función auxiliar sin recursión de RLS: la pareja del usuario autenticado.
create or replace function mi_pareja_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pareja_id from public.usuarios where id = auth.uid();
$$;

create policy "usuarios_select_propio_o_pareja"
  on usuarios for select
  using (id = auth.uid() or pareja_id = mi_pareja_id());

create policy "usuarios_update_propio"
  on usuarios for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "usuarios_insert_propio"
  on usuarios for insert
  with check (id = auth.uid());
