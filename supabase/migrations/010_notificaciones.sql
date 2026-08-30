-- Implementa BJ2-004 — bandeja de notificaciones internas por usuario

create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  tipo text not null check (tipo in ('reset_semanal','carta_recibida')),
  leido boolean not null default false,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_notificaciones_usuario_fecha
  on notificaciones (usuario_id, created_at desc);

alter table notificaciones enable row level security;

create policy "notificaciones_select_propio"
  on notificaciones for select
  using (usuario_id = auth.uid());

create policy "notificaciones_update_propio"
  on notificaciones for update
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "notificaciones_insert_pareja"
  on notificaciones for insert
  with check (
    usuario_id = auth.uid()
    or usuario_id in (select id from usuarios where pareja_id = mi_pareja_id())
  );
