-- Implementa BJ2-004 — puntos acumulados por jugador y ciclo (no se acumulan entre ciclos, supuesto S4)

create table if not exists puntos_semanales (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  pareja_id uuid not null references parejas(id),
  ciclo_numero integer not null,
  puntos integer not null default 0,
  unique (usuario_id, ciclo_numero)
);

create index if not exists idx_puntos_semanales_pareja_ciclo
  on puntos_semanales (pareja_id, ciclo_numero);

alter table puntos_semanales enable row level security;

create policy "puntos_semanales_select_pareja"
  on puntos_semanales for select
  using (es_miembro_de_pareja(pareja_id));

create policy "puntos_semanales_insert_pareja"
  on puntos_semanales for insert
  with check (es_miembro_de_pareja(pareja_id));

create policy "puntos_semanales_update_pareja"
  on puntos_semanales for update
  using (es_miembro_de_pareja(pareja_id))
  with check (es_miembro_de_pareja(pareja_id));
