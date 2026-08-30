-- Implementa BJ2-004 — catálogo de cartas (contenido cargado por scripts/importar-catalogo.ts)

create table if not exists catalogo_cartas (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  tipo text not null check (tipo in ('estandar','spicy')),
  modalidad text not null check (modalidad in ('distancia','hibrida','fisica','todas')),
  puntos_otorgados integer not null default 1,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_catalogo_cartas_filtro
  on catalogo_cartas (tipo, modalidad, activo);

alter table catalogo_cartas enable row level security;

-- Cualquier usuario autenticado puede leer el catálogo activo. La escritura queda
-- reservada al service_role (scripts de importación), que ignora RLS.
create policy "catalogo_cartas_select_autenticado"
  on catalogo_cartas for select
  to authenticated
  using (true);
