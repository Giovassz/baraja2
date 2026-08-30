-- Implementa BJ2-004 — estructura lista para Fase 9 (monetización). SIN lógica de cobro todavía.

create table if not exists suscripciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  plan text not null default 'gratis' check (plan in ('gratis','plus')),
  estado text not null default 'activa' check (estado in ('activa','vencida','cancelada')),
  fecha_inicio timestamptz not null default now(),
  fecha_renovacion timestamptz,
  stripe_customer_id text,
  unique (usuario_id)
);

alter table suscripciones enable row level security;

create policy "suscripciones_select_propio"
  on suscripciones for select
  using (usuario_id = auth.uid());
-- Sin políticas de insert/update para usuarios: la Fase 9 las gestionará vía webhook (service_role).
