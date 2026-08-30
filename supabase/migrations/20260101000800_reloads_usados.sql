-- Implementa BJ2-004 — registro de uso del botón de reload (1 por ciclo, sección 4.8)

create table if not exists reloads_usados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  ciclo_numero integer not null,
  usado_en timestamptz not null default now(),
  unique (usuario_id, ciclo_numero)
);

alter table reloads_usados enable row level security;

create policy "reloads_usados_select_propio"
  on reloads_usados for select
  using (usuario_id = auth.uid());

create policy "reloads_usados_insert_propio"
  on reloads_usados for insert
  with check (usuario_id = auth.uid());
