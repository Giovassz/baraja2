-- Implementa BJ2-004 — catálogo de plot twists (comodines)

create table if not exists catalogo_plot_twists (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null,
  efecto text not null check (efecto in ('bloquear_carta','robar_carta','otro')),
  modalidad text not null check (modalidad in ('distancia','hibrida','fisica')),
  tipo text not null check (tipo in ('estandar','spicy')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_catalogo_plot_twists_filtro
  on catalogo_plot_twists (modalidad, tipo, activo);

alter table catalogo_plot_twists enable row level security;

create policy "catalogo_plot_twists_select_autenticado"
  on catalogo_plot_twists for select
  to authenticated
  using (true);
