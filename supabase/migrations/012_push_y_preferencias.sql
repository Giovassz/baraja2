-- Implementa BJ2-004 (extensión para Fase 6) — suscripciones Web Push y preferencias de notificación.
-- Estas tablas no están en la sección 3 del prompt maestro pero son necesarias para BJ2-038..040.

create table if not exists push_suscripciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (usuario_id, endpoint)
);

alter table push_suscripciones enable row level security;

create policy "push_suscripciones_todo_propio"
  on push_suscripciones for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create table if not exists preferencias_notificacion (
  usuario_id uuid primary key references usuarios(id) on delete cascade,
  reset_semanal boolean not null default true,
  carta_recibida boolean not null default true,
  actualizado_en timestamptz not null default now()
);

alter table preferencias_notificacion enable row level security;

create policy "preferencias_notificacion_todo_propio"
  on preferencias_notificacion for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- Fila de preferencias por defecto al crear el perfil.
create or replace function crear_preferencias_notificacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.preferencias_notificacion (usuario_id)
  values (new.id)
  on conflict (usuario_id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_perfil_preferencias on usuarios;
create trigger al_crear_perfil_preferencias
  after insert on usuarios
  for each row execute function crear_preferencias_notificacion();
