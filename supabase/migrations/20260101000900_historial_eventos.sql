-- Implementa BJ2-004 — línea de tiempo de eventos de la pareja (Fase 8)

create table if not exists historial_eventos (
  id uuid primary key default gen_random_uuid(),
  pareja_id uuid not null references parejas(id),
  usuario_id uuid not null references usuarios(id),
  tipo_evento text not null check (tipo_evento in ('carta_cumplida','plot_twist_usado')),
  referencia_id uuid not null,
  descripcion text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_historial_eventos_pareja_fecha
  on historial_eventos (pareja_id, created_at desc);

alter table historial_eventos enable row level security;

create policy "historial_eventos_select_pareja"
  on historial_eventos for select
  using (es_miembro_de_pareja(pareja_id));

create policy "historial_eventos_insert_pareja"
  on historial_eventos for insert
  with check (es_miembro_de_pareja(pareja_id));
