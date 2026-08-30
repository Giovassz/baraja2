-- Implementa BJ2-004 — plot twists que un jugador ha desbloqueado por ciclo

create table if not exists plot_twists_desbloqueados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  plot_twist_id uuid not null references catalogo_plot_twists(id),
  ciclo_numero integer not null,
  usado boolean not null default false,
  carta_objetivo_id uuid references cartas_asignadas(id),
  fecha_desbloqueo timestamptz not null default now(),
  fecha_uso timestamptz
);

create index if not exists idx_plot_twists_desbloqueados_usuario_ciclo
  on plot_twists_desbloqueados (usuario_id, ciclo_numero);

alter table plot_twists_desbloqueados enable row level security;

-- Cada quien ve sus propios plot twists (y los de su pareja, para el WidgetVS).
create policy "plot_twists_desbloqueados_select_pareja"
  on plot_twists_desbloqueados for select
  using (
    usuario_id = auth.uid()
    or usuario_id in (
      select id from usuarios where pareja_id = mi_pareja_id()
    )
  );

create policy "plot_twists_desbloqueados_update_propio"
  on plot_twists_desbloqueados for update
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());
