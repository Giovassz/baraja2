-- Implementa BJ2-004 — cartas repartidas a cada jugador por ciclo semanal

create table if not exists cartas_asignadas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  pareja_id uuid not null references parejas(id),
  carta_id uuid not null references catalogo_cartas(id),
  ciclo_numero integer not null,
  estado text not null default 'disponible'
    check (estado in ('disponible','jugada','cumplida','bloqueada','robada')),
  jugada_hacia_usuario_id uuid references usuarios(id),
  fecha_asignacion timestamptz not null default now(),
  fecha_jugada timestamptz,
  fecha_cumplida timestamptz
);

create index if not exists idx_cartas_asignadas_usuario_ciclo
  on cartas_asignadas (usuario_id, ciclo_numero);
create index if not exists idx_cartas_asignadas_pareja_ciclo
  on cartas_asignadas (pareja_id, ciclo_numero);

alter table cartas_asignadas enable row level security;

-- Ambos miembros de la pareja pueden ver todas las cartas de esa pareja.
create policy "cartas_asignadas_select_pareja"
  on cartas_asignadas for select
  using (es_miembro_de_pareja(pareja_id));

-- Las mutaciones de juego pasan por Server Actions; aun así se limita por pareja.
create policy "cartas_asignadas_update_pareja"
  on cartas_asignadas for update
  using (es_miembro_de_pareja(pareja_id))
  with check (es_miembro_de_pareja(pareja_id));

-- La inserción real la hace el cron (service_role). Se permite al miembro solo
-- para operaciones asistidas desde Server Actions (reload / robo de carta).
create policy "cartas_asignadas_insert_pareja"
  on cartas_asignadas for insert
  with check (es_miembro_de_pareja(pareja_id));

create policy "cartas_asignadas_delete_propio"
  on cartas_asignadas for delete
  using (usuario_id = auth.uid() and estado = 'disponible');
