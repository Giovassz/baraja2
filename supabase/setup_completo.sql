-- ============================================================================
-- Baraja2 - Esquema completo. Pegar TODO en Supabase Dashboard -> SQL Editor -> Run.
-- Idempotente en su mayoria (create table if not exists / create or replace).
-- ============================================================================

-- >>>>>>>>>>>>>>>>>>>>  20260101000100_usuarios.sql  <<<<<<<<<<<<<<<<<<<<
-- Implementa BJ2-004 — tabla de usuarios
-- La FK usuarios.pareja_id -> parejas(id) se agrega en 002 (dependencia circular).

create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  avatar_id text, -- referencia al catálogo estático de avatares (lib/reglas/avatares.ts)
  confirmo_mayor_edad boolean not null default false,
  pareja_id uuid,
  modo_spicy_activo boolean not null default false, -- preferencia de UI (supuesto S3/4.7)
  created_at timestamptz not null default now()
);

comment on table usuarios is 'Perfil de cada jugador de Baraja2. El id coincide con auth.users.';

-- Crea automáticamente la fila de usuarios al registrarse en Supabase Auth.
create or replace function crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, confirmo_mayor_edad)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', 'Jugador'),
    coalesce((new.raw_user_meta_data->>'confirmo_mayor_edad')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario_auth on auth.users;
create trigger al_crear_usuario_auth
  after insert on auth.users
  for each row execute function crear_perfil_usuario();

-- Row Level Security
alter table usuarios enable row level security;

-- Función auxiliar sin recursión de RLS: la pareja del usuario autenticado.
create or replace function mi_pareja_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pareja_id from public.usuarios where id = auth.uid();
$$;

create policy "usuarios_select_propio_o_pareja"
  on usuarios for select
  using (id = auth.uid() or pareja_id = mi_pareja_id());

create policy "usuarios_update_propio"
  on usuarios for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "usuarios_insert_propio"
  on usuarios for insert
  with check (id = auth.uid());


-- >>>>>>>>>>>>>>>>>>>>  20260101000200_parejas.sql  <<<<<<<<<<<<<<<<<<<<
-- Implementa BJ2-004 — tabla de parejas + FK circular con usuarios + helpers de RLS

create table if not exists parejas (
  id uuid primary key default gen_random_uuid(),
  nombre_espacio text,
  modalidad text not null check (modalidad in ('distancia','hibrida','fisica')),
  codigo_invitacion text unique not null,
  codigo_usado boolean not null default false,
  usuario_1_id uuid not null references usuarios(id),
  usuario_2_id uuid references usuarios(id),
  fecha_vinculacion timestamptz, -- se asigna cuando usuario_2 se une
  created_at timestamptz not null default now()
);

comment on table parejas is 'Un espacio compartido entre dos jugadores. usuario_2_id es null hasta la vinculación.';

alter table usuarios
  drop constraint if exists fk_usuarios_pareja;
alter table usuarios
  add constraint fk_usuarios_pareja
  foreign key (pareja_id) references parejas(id);

-- Helper reutilizable para políticas RLS de todas las tablas con pareja_id.
create or replace function es_miembro_de_pareja(p_pareja_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parejas
    where id = p_pareja_id
      and (usuario_1_id = auth.uid() or usuario_2_id = auth.uid())
  );
$$;

alter table parejas enable row level security;

-- Se puede leer una pareja si eres miembro, o si el código de invitación coincide
-- (necesario en el flujo de vinculación, antes de ser miembro).
create policy "parejas_select_miembro"
  on parejas for select
  using (usuario_1_id = auth.uid() or usuario_2_id = auth.uid());

create policy "parejas_insert_creador"
  on parejas for insert
  with check (usuario_1_id = auth.uid());

create policy "parejas_update_miembro"
  on parejas for update
  using (usuario_1_id = auth.uid() or usuario_2_id = auth.uid())
  with check (usuario_1_id = auth.uid() or usuario_2_id = auth.uid());

-- RPC de vinculación: el segundo jugador se une usando el código de invitación.
-- SECURITY DEFINER porque quien llama todavía no es miembro de la pareja.
create or replace function vincular_con_codigo(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pareja parejas%rowtype;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'SIN_SESION';
  end if;

  select * into v_pareja from parejas
  where upper(codigo_invitacion) = upper(trim(p_codigo))
  for update;

  if not found then
    raise exception 'CODIGO_INVALIDO';
  end if;

  if v_pareja.codigo_usado or v_pareja.usuario_2_id is not null then
    raise exception 'CODIGO_YA_USADO';
  end if;

  if v_pareja.usuario_1_id = v_uid then
    raise exception 'NO_PUEDES_UNIRTE_A_TU_PROPIO_ESPACIO';
  end if;

  if (select pareja_id from usuarios where id = v_uid) is not null then
    raise exception 'YA_TIENES_PAREJA';
  end if;

  update parejas
    set usuario_2_id = v_uid,
        codigo_usado = true,
        fecha_vinculacion = now()
  where id = v_pareja.id;

  update usuarios set pareja_id = v_pareja.id where id = v_uid;
  update usuarios set pareja_id = v_pareja.id where id = v_pareja.usuario_1_id;

  return v_pareja.id;
end;
$$;


-- >>>>>>>>>>>>>>>>>>>>  20260101000300_catalogo_cartas.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101000400_catalogo_plot_twists.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101000500_cartas_asignadas.sql  <<<<<<<<<<<<<<<<<<<<
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
  fecha_cumplida timestamptz,
  reclamada_en timestamptz
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


-- >>>>>>>>>>>>>>>>>>>>  20260101000600_plot_twists_desbloqueados.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101000700_puntos_semanales.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101000800_reloads_usados.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101000900_historial_eventos.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101001000_notificaciones.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101001100_suscripciones.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101001200_push_y_preferencias.sql  <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>>  20260101001300_rpc_mecanica.sql  <<<<<<<<<<<<<<<<<<<<
-- Implementa BJ2-015..022 (mecánica de cartas), BJ2-023..029 (plot twists), BJ2-034..037 (reload)
-- Toda la mecánica que necesita atomicidad vive en funciones de Postgres. Las Server Actions
-- de lib/actions/*.ts validan la entrada con zod y llaman a estas funciones.

-- Constantes de negocio (deben coincidir con lib/reglas/constantes.ts)
create or replace function puntos_por_carta_cumplida() returns integer
  language sql immutable as $$ select 1 $$;
create or replace function puntos_para_desbloquear_plot_twist() returns integer
  language sql immutable as $$ select 3 $$;

-- Número de ciclo semanal de una pareja (sección 4.1).
create or replace function ciclo_actual(p_pareja_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.fecha_vinculacion is null then 0
    else floor(extract(epoch from (now() - p.fecha_vinculacion)) / 604800)::int + 1
  end
  from parejas p
  where p.id = p_pareja_id;
$$;

-- Asigna `p_cantidad` cartas estándar aleatorias a un jugador para un ciclo,
-- sin repetir cartas que ya tenga en ese ciclo (sección 4.2). Si el catálogo no
-- alcanza, permite repetición y emite WARNING. Devuelve cuántas insertó.
create or replace function asignar_cartas(
  p_usuario_id uuid,
  p_pareja_id uuid,
  p_ciclo integer,
  p_cantidad integer,
  p_excluir uuid[] default '{}'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_modalidad text;
  v_disponibles uuid[];
  v_elegidas uuid[];
  v_carta uuid;
  v_insertadas integer := 0;
  v_i integer;
begin
  select modalidad into v_modalidad from parejas where id = p_pareja_id;

  select array_agg(c.id) into v_disponibles
  from catalogo_cartas c
  where c.tipo = 'estandar'
    and c.activo = true
    and c.modalidad in (v_modalidad, 'todas')
    and c.id <> all(coalesce(p_excluir, '{}'::uuid[]))
    and c.id not in (
      select carta_id from cartas_asignadas
      where usuario_id = p_usuario_id and ciclo_numero = p_ciclo
    );

  v_disponibles := coalesce(v_disponibles, '{}'::uuid[]);

  if array_length(v_disponibles, 1) is null
     or array_length(v_disponibles, 1) < p_cantidad then
    raise warning 'Catálogo insuficiente para modalidad % (hay %, se piden %). Se permitirá repetición.',
      v_modalidad, coalesce(array_length(v_disponibles, 1), 0), p_cantidad;

    -- Rellena el pool con todas las cartas válidas de la modalidad (permitiendo repetir).
    select array_agg(c.id) into v_elegidas
    from catalogo_cartas c
    where c.tipo = 'estandar' and c.activo = true
      and c.modalidad in (v_modalidad, 'todas');
    v_elegidas := coalesce(v_elegidas, '{}'::uuid[]);

    if array_length(v_elegidas, 1) is null then
      raise warning 'No hay ninguna carta estándar activa para la modalidad %.', v_modalidad;
      return 0;
    end if;

    for v_i in 1..p_cantidad loop
      v_carta := v_elegidas[1 + floor(random() * array_length(v_elegidas, 1))::int];
      insert into cartas_asignadas (usuario_id, pareja_id, carta_id, ciclo_numero)
      values (p_usuario_id, p_pareja_id, v_carta, p_ciclo);
      v_insertadas := v_insertadas + 1;
    end loop;
    return v_insertadas;
  end if;

  -- Camino normal: muestreo aleatorio sin repetición.
  select array_agg(id order by random()) into v_elegidas
  from unnest(v_disponibles) as t(id);

  for v_i in 1..p_cantidad loop
    insert into cartas_asignadas (usuario_id, pareja_id, carta_id, ciclo_numero)
    values (p_usuario_id, p_pareja_id, v_elegidas[v_i], p_ciclo);
    v_insertadas := v_insertadas + 1;
  end loop;

  return v_insertadas;
end;
$$;

-- Evalúa el umbral de puntos y desbloquea plot twists si corresponde (sección 4.4).
create or replace function evaluar_plot_twists(
  p_usuario_id uuid,
  p_pareja_id uuid,
  p_ciclo integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_puntos integer;
  v_umbral integer := puntos_para_desbloquear_plot_twist();
  v_merecidos integer;
  v_ya integer;
  v_faltan integer;
  v_modalidad text;
  v_spicy boolean;
  v_pt uuid;
  v_desbloqueados integer := 0;
begin
  select coalesce(puntos, 0) into v_puntos
  from puntos_semanales
  where usuario_id = p_usuario_id and ciclo_numero = p_ciclo;
  v_puntos := coalesce(v_puntos, 0);

  v_merecidos := floor(v_puntos / v_umbral);

  select count(*) into v_ya
  from plot_twists_desbloqueados
  where usuario_id = p_usuario_id and ciclo_numero = p_ciclo;

  v_faltan := v_merecidos - v_ya;
  if v_faltan <= 0 then
    return 0;
  end if;

  select p.modalidad, u.modo_spicy_activo
    into v_modalidad, v_spicy
  from usuarios u join parejas p on p.id = p_pareja_id
  where u.id = p_usuario_id;

  while v_faltan > 0 loop
    select ct.id into v_pt
    from catalogo_plot_twists ct
    where ct.activo = true
      and ct.modalidad = v_modalidad
      and (ct.tipo = 'estandar' or (v_spicy and ct.tipo = 'spicy'))
      and ct.id not in (
        select plot_twist_id from plot_twists_desbloqueados
        where usuario_id = p_usuario_id and ciclo_numero = p_ciclo
      )
    order by random()
    limit 1;

    exit when v_pt is null; -- no quedan plot twists distintos por desbloquear

    insert into plot_twists_desbloqueados (usuario_id, plot_twist_id, ciclo_numero)
    values (p_usuario_id, v_pt, p_ciclo);

    v_desbloqueados := v_desbloqueados + 1;
    v_faltan := v_faltan - 1;
  end loop;

  return v_desbloqueados;
end;
$$;

-- Jugar una carta hacia la pareja (sección 4.3).
create or replace function jugar_carta(p_carta_asignada_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_carta cartas_asignadas%rowtype;
  v_receptor uuid;
begin
  select * into v_carta from cartas_asignadas where id = p_carta_asignada_id for update;
  if not found then raise exception 'CARTA_NO_ENCONTRADA'; end if;
  if v_carta.usuario_id <> v_uid then raise exception 'NO_ERES_DUENO'; end if;
  if v_carta.estado <> 'disponible' then raise exception 'CARTA_NO_DISPONIBLE'; end if;

  select case when usuario_1_id = v_uid then usuario_2_id else usuario_1_id end
    into v_receptor
  from parejas where id = v_carta.pareja_id;

  if v_receptor is null then raise exception 'PAREJA_INCOMPLETA'; end if;

  update cartas_asignadas
    set estado = 'jugada',
        fecha_jugada = now(),
        jugada_hacia_usuario_id = v_receptor
  where id = p_carta_asignada_id;

  insert into notificaciones (usuario_id, tipo, payload)
  values (v_receptor, 'carta_recibida', jsonb_build_object('carta_asignada_id', p_carta_asignada_id));
end;
$$;

-- Paso 1: el receptor avisa que ya cumplió el reto en la vida real (sección 4.3).
create or replace function reclamar_cumplida(p_carta_asignada_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_carta cartas_asignadas%rowtype;
begin
  select * into v_carta from cartas_asignadas where id = p_carta_asignada_id for update;
  if not found then raise exception 'CARTA_NO_ENCONTRADA'; end if;
  if v_carta.jugada_hacia_usuario_id <> v_uid then raise exception 'NO_ERES_RECEPTOR'; end if;
  if v_carta.estado <> 'jugada' then raise exception 'CARTA_NO_JUGADA'; end if;
  if v_carta.reclamada_en is not null then raise exception 'YA_RECLAMADA'; end if;

  update cartas_asignadas set reclamada_en = now() where id = p_carta_asignada_id;
end;
$$;

grant execute on function reclamar_cumplida(uuid) to authenticated;

-- Paso 2: quien mandó la carta confirma que sí se cumplió (sección 4.3).
create or replace function confirmar_cumplida(p_carta_asignada_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_carta cartas_asignadas%rowtype;
  v_texto text;
  v_puntos integer := puntos_por_carta_cumplida();
  v_ciclo integer;
begin
  select * into v_carta from cartas_asignadas where id = p_carta_asignada_id for update;
  if not found then raise exception 'CARTA_NO_ENCONTRADA'; end if;
  if v_carta.usuario_id <> v_uid then raise exception 'NO_ERES_QUIEN_LA_MANDO'; end if;
  if v_carta.estado <> 'jugada' then raise exception 'CARTA_NO_JUGADA'; end if;
  if v_carta.reclamada_en is null then raise exception 'AUN_NO_RECLAMADA'; end if;
  if v_carta.jugada_hacia_usuario_id is null then raise exception 'PAREJA_INCOMPLETA'; end if;

  update cartas_asignadas
    set estado = 'cumplida', fecha_cumplida = now()
  where id = p_carta_asignada_id;

  v_ciclo := v_carta.ciclo_numero;

  -- Los puntos los gana quien cumplió el reto en la vida real (el receptor de la
  -- carta); quien la mandó es quien confirma que sí se cumplió.
  insert into puntos_semanales (usuario_id, pareja_id, ciclo_numero, puntos)
  values (v_carta.jugada_hacia_usuario_id, v_carta.pareja_id, v_ciclo, v_puntos)
  on conflict (usuario_id, ciclo_numero)
  do update set puntos = puntos_semanales.puntos + v_puntos;

  select texto into v_texto from catalogo_cartas where id = v_carta.carta_id;

  insert into historial_eventos (pareja_id, usuario_id, tipo_evento, referencia_id, descripcion)
  values (
    v_carta.pareja_id,
    v_carta.jugada_hacia_usuario_id,
    'carta_cumplida',
    p_carta_asignada_id,
    coalesce(v_texto, 'Carta cumplida')
  );

  perform evaluar_plot_twists(v_carta.jugada_hacia_usuario_id, v_carta.pareja_id, v_ciclo);
end;
$$;

-- Usar un plot twist para BLOQUEAR una carta de la pareja (sección 4.4).
create or replace function usar_plot_twist_bloquear(
  p_ptd_id uuid,
  p_carta_objetivo_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ptd plot_twists_desbloqueados%rowtype;
  v_objetivo cartas_asignadas%rowtype;
  v_mi_pareja uuid;
  v_nombre text;
begin
  select pareja_id into v_mi_pareja from usuarios where id = v_uid;

  select * into v_ptd from plot_twists_desbloqueados where id = p_ptd_id for update;
  if not found then raise exception 'PLOT_TWIST_NO_ENCONTRADO'; end if;
  if v_ptd.usuario_id <> v_uid then raise exception 'NO_ES_TU_PLOT_TWIST'; end if;
  if v_ptd.usado then raise exception 'PLOT_TWIST_YA_USADO'; end if;

  select * into v_objetivo from cartas_asignadas where id = p_carta_objetivo_id for update;
  if not found then raise exception 'CARTA_OBJETIVO_NO_ENCONTRADA'; end if;
  if v_objetivo.pareja_id <> v_mi_pareja then raise exception 'CARTA_FUERA_DE_TU_PAREJA'; end if;
  if v_objetivo.estado not in ('disponible') then raise exception 'CARTA_OBJETIVO_NO_BLOQUEABLE'; end if;

  update cartas_asignadas set estado = 'bloqueada' where id = p_carta_objetivo_id;

  update plot_twists_desbloqueados
    set usado = true, fecha_uso = now(), carta_objetivo_id = p_carta_objetivo_id
  where id = p_ptd_id;

  select nombre into v_nombre from catalogo_plot_twists where id = v_ptd.plot_twist_id;

  insert into historial_eventos (pareja_id, usuario_id, tipo_evento, referencia_id, descripcion)
  values (v_mi_pareja, v_uid, 'plot_twist_usado', p_ptd_id,
    coalesce(v_nombre, 'Plot twist') || ': carta bloqueada');
end;
$$;

-- Usar un plot twist para ROBAR una carta de la pareja (sección 4.4).
create or replace function usar_plot_twist_robar(
  p_ptd_id uuid,
  p_carta_objetivo_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ptd plot_twists_desbloqueados%rowtype;
  v_objetivo cartas_asignadas%rowtype;
  v_mi_pareja uuid;
  v_nombre text;
  v_nueva uuid;
begin
  select pareja_id into v_mi_pareja from usuarios where id = v_uid;

  select * into v_ptd from plot_twists_desbloqueados where id = p_ptd_id for update;
  if not found then raise exception 'PLOT_TWIST_NO_ENCONTRADO'; end if;
  if v_ptd.usuario_id <> v_uid then raise exception 'NO_ES_TU_PLOT_TWIST'; end if;
  if v_ptd.usado then raise exception 'PLOT_TWIST_YA_USADO'; end if;

  select * into v_objetivo from cartas_asignadas where id = p_carta_objetivo_id for update;
  if not found then raise exception 'CARTA_OBJETIVO_NO_ENCONTRADA'; end if;
  if v_objetivo.pareja_id <> v_mi_pareja then raise exception 'CARTA_FUERA_DE_TU_PAREJA'; end if;
  if v_objetivo.usuario_id = v_uid then raise exception 'NO_PUEDES_ROBARTE_A_TI_MISMO'; end if;
  if v_objetivo.estado <> 'disponible' then raise exception 'CARTA_OBJETIVO_NO_ROBABLE'; end if;

  -- El registro original queda marcado como robado.
  update cartas_asignadas set estado = 'robada' where id = p_carta_objetivo_id;

  -- Se crea una nueva carta asignada disponible para el nuevo dueño.
  insert into cartas_asignadas (usuario_id, pareja_id, carta_id, ciclo_numero, estado)
  values (v_uid, v_mi_pareja, v_objetivo.carta_id, v_objetivo.ciclo_numero, 'disponible')
  returning id into v_nueva;

  update plot_twists_desbloqueados
    set usado = true, fecha_uso = now(), carta_objetivo_id = p_carta_objetivo_id
  where id = p_ptd_id;

  select nombre into v_nombre from catalogo_plot_twists where id = v_ptd.plot_twist_id;

  insert into historial_eventos (pareja_id, usuario_id, tipo_evento, referencia_id, descripcion)
  values (v_mi_pareja, v_uid, 'plot_twist_usado', p_ptd_id,
    coalesce(v_nombre, 'Plot twist') || ': carta robada');

  return v_nueva;
end;
$$;

-- Botón de reload: 1 por ciclo (sección 4.8).
create or replace function recargar_cartas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pareja uuid;
  v_ciclo integer;
  v_perdidas uuid[];
  v_cuantas integer;
begin
  select pareja_id into v_pareja from usuarios where id = v_uid;
  if v_pareja is null then raise exception 'SIN_PAREJA'; end if;

  v_ciclo := ciclo_actual(v_pareja);

  if exists (
    select 1 from reloads_usados where usuario_id = v_uid and ciclo_numero = v_ciclo
  ) then
    raise exception 'RELOAD_YA_USADO';
  end if;

  select array_agg(carta_id) into v_perdidas
  from cartas_asignadas
  where usuario_id = v_uid and ciclo_numero = v_ciclo and estado = 'disponible';

  v_cuantas := coalesce(array_length(v_perdidas, 1), 0);

  if v_cuantas = 0 then
    raise exception 'SIN_CARTAS_DISPONIBLES';
  end if;

  delete from cartas_asignadas
  where usuario_id = v_uid and ciclo_numero = v_ciclo and estado = 'disponible';

  perform asignar_cartas(v_uid, v_pareja, v_ciclo, v_cuantas, v_perdidas);

  insert into reloads_usados (usuario_id, ciclo_numero) values (v_uid, v_ciclo);

  return v_cuantas;
end;
$$;


-- >>>>>>>>>>>>>>>>>>>>  20260101001400_rpc_reinicio_semanal.sql  <<<<<<<<<<<<<<<<<<<<
-- Implementa BJ2-016 / BJ2-039 — reinicio semanal automático (sección 4.1)
-- Lo invoca el cron diario: app/api/cron/reinicio-semanal/route.ts

-- Reparte el ciclo `p_ciclo` a una pareja concreta (idempotente por ciclo).
create or replace function repartir_ciclo_pareja(p_pareja_id uuid, p_ciclo integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pareja parejas%rowtype;
  v_usuario uuid;
begin
  select * into v_pareja from parejas where id = p_pareja_id for update;
  if not found or v_pareja.usuario_2_id is null then
    return; -- pareja incompleta: no se reparte
  end if;

  foreach v_usuario in array array[v_pareja.usuario_1_id, v_pareja.usuario_2_id] loop
    -- Idempotencia: si ya tiene cartas de este ciclo, no se vuelve a repartir.
    if not exists (
      select 1 from cartas_asignadas
      where usuario_id = v_usuario and ciclo_numero = p_ciclo
    ) then
      perform asignar_cartas(v_usuario, p_pareja_id, p_ciclo, 5);
    end if;

    -- Puntos del nuevo ciclo arrancan en 0 (supuesto S4: no se acumulan).
    insert into puntos_semanales (usuario_id, pareja_id, ciclo_numero, puntos)
    values (v_usuario, p_pareja_id, p_ciclo, 0)
    on conflict (usuario_id, ciclo_numero) do nothing;

    -- Notificación de reinicio (respeta preferencias del usuario).
    if coalesce(
      (select reset_semanal from preferencias_notificacion where usuario_id = v_usuario),
      true
    ) then
      insert into notificaciones (usuario_id, tipo, payload)
      values (v_usuario, 'reset_semanal', jsonb_build_object('ciclo', p_ciclo));
    end if;
  end loop;
end;
$$;

-- Recorre todas las parejas y reparte el ciclo que les toque. Devuelve cuántas se procesaron.
create or replace function reiniciar_ciclos_semanales()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p record;
  v_ciclo integer;
  v_ultimo integer;
  v_procesadas integer := 0;
begin
  for v_p in
    select id from parejas
    where usuario_2_id is not null and fecha_vinculacion is not null
  loop
    v_ciclo := ciclo_actual(v_p.id);

    select coalesce(max(ciclo_numero), 0) into v_ultimo
    from cartas_asignadas where pareja_id = v_p.id;

    if v_ciclo > v_ultimo then
      -- Reparte cualquier ciclo pendiente (normalmente solo el actual).
      for v_ciclo in (v_ultimo + 1)..v_ciclo loop
        perform repartir_ciclo_pareja(v_p.id, v_ciclo);
      end loop;
      v_procesadas := v_procesadas + 1;
    end if;
  end loop;

  return v_procesadas;
end;
$$;

-- Reparte el primer ciclo en el momento exacto de la vinculación (sin esperar al cron).
create or replace function al_vincular_repartir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.usuario_2_id is null and new.usuario_2_id is not null then
    perform repartir_ciclo_pareja(new.id, 1);
  end if;
  return new;
end;
$$;

drop trigger if exists al_vincular_pareja on parejas;
create trigger al_vincular_pareja
  after update on parejas
  for each row execute function al_vincular_repartir();

-- Permisos de ejecución para clientes autenticados donde aplica.
grant execute on function jugar_carta(uuid) to authenticated;
grant execute on function confirmar_cumplida(uuid) to authenticated;
grant execute on function usar_plot_twist_bloquear(uuid, uuid) to authenticated;
grant execute on function usar_plot_twist_robar(uuid, uuid) to authenticated;
grant execute on function recargar_cartas() to authenticated;
grant execute on function vincular_con_codigo(text) to authenticated;
grant execute on function ciclo_actual(uuid) to authenticated;
grant execute on function mi_pareja_id() to authenticated;
grant execute on function es_miembro_de_pareja(uuid) to authenticated;

-- Estas solo las llama el service_role (cron):
revoke execute on function reiniciar_ciclos_semanales() from public;
revoke execute on function repartir_ciclo_pareja(uuid, integer) from public;
revoke execute on function asignar_cartas(uuid, uuid, integer, integer, uuid[]) from public;
revoke execute on function evaluar_plot_twists(uuid, uuid, integer) from public;


-- >>>>>>>>>>>>>>>>>>>>  20260101001500_rpc_spicy.sql  <<<<<<<<<<<<<<<<<<<<
-- Implementa BJ2-032 — jugar una carta Spicy (fuera del ciclo de 5, supuesto S3)
-- La carta Spicy se materializa en cartas_asignadas al jugarse; luego sigue el
-- flujo normal de confirmar_cumplida (que otorga PUNTOS_POR_CARTA_CUMPLIDA).

create or replace function jugar_carta_spicy(p_catalogo_carta_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pareja parejas%rowtype;
  v_carta catalogo_cartas%rowtype;
  v_spicy boolean;
  v_receptor uuid;
  v_ciclo integer;
  v_nueva uuid;
begin
  select p.* into v_pareja
  from parejas p
  join usuarios u on u.pareja_id = p.id
  where u.id = v_uid;

  if not found then raise exception 'SIN_PAREJA'; end if;
  if v_pareja.usuario_2_id is null then raise exception 'PAREJA_INCOMPLETA'; end if;

  select modo_spicy_activo into v_spicy from usuarios where id = v_uid;
  if not coalesce(v_spicy, false) then raise exception 'MODO_SPICY_INACTIVO'; end if;

  select * into v_carta from catalogo_cartas where id = p_catalogo_carta_id;
  if not found then raise exception 'CARTA_NO_ENCONTRADA'; end if;
  if v_carta.tipo <> 'spicy' or not v_carta.activo then raise exception 'CARTA_NO_DISPONIBLE'; end if;
  if v_carta.modalidad not in (v_pareja.modalidad, 'todas') then
    raise exception 'CARTA_FUERA_DE_TU_PAREJA';
  end if;

  v_receptor := case when v_pareja.usuario_1_id = v_uid
                     then v_pareja.usuario_2_id else v_pareja.usuario_1_id end;
  v_ciclo := ciclo_actual(v_pareja.id);

  insert into cartas_asignadas
    (usuario_id, pareja_id, carta_id, ciclo_numero, estado, jugada_hacia_usuario_id, fecha_jugada)
  values
    (v_uid, v_pareja.id, p_catalogo_carta_id, v_ciclo, 'jugada', v_receptor, now())
  returning id into v_nueva;

  insert into notificaciones (usuario_id, tipo, payload)
  values (v_receptor, 'carta_recibida',
          jsonb_build_object('carta_asignada_id', v_nueva, 'spicy', true));

  return v_nueva;
end;
$$;

grant execute on function jugar_carta_spicy(uuid) to authenticated;


-- >>>>>>>>>>>>>>>>>>>>  20260101001600_rpc_tienda.sql  <<<<<<<<<<<<<<<<<<<<
-- Tienda de plot twists: gasta puntos del ciclo para desbloquear el plot twist que elijas.
-- Función nueva pedida por el usuario (no está en el prompt maestro original).

create or replace function precio_plot_twist_tienda() returns integer
  language sql immutable as $$ select 3 $$;

create or replace function comprar_plot_twist(p_catalogo_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pareja uuid;
  v_ciclo integer;
  v_precio integer := precio_plot_twist_tienda();
  v_puntos integer;
  v_ct catalogo_plot_twists%rowtype;
  v_spicy boolean;
  v_modalidad text;
  v_nuevo uuid;
begin
  select pareja_id, modo_spicy_activo into v_pareja, v_spicy from usuarios where id = v_uid;
  if v_pareja is null then raise exception 'SIN_PAREJA'; end if;

  select modalidad into v_modalidad from parejas where id = v_pareja;
  v_ciclo := ciclo_actual(v_pareja);

  select * into v_ct from catalogo_plot_twists where id = p_catalogo_id;
  if not found or not v_ct.activo then raise exception 'PLOT_TWIST_NO_ENCONTRADO'; end if;
  if v_ct.modalidad <> v_modalidad then raise exception 'PLOT_TWIST_FUERA_DE_MODALIDAD'; end if;
  if v_ct.tipo = 'spicy' and not coalesce(v_spicy, false) then
    raise exception 'MODO_SPICY_INACTIVO';
  end if;

  select coalesce(puntos, 0) into v_puntos
  from puntos_semanales
  where usuario_id = v_uid and ciclo_numero = v_ciclo;
  v_puntos := coalesce(v_puntos, 0);

  if v_puntos < v_precio then
    raise exception 'PUNTOS_INSUFICIENTES';
  end if;

  update puntos_semanales
    set puntos = puntos - v_precio
  where usuario_id = v_uid and ciclo_numero = v_ciclo;

  insert into plot_twists_desbloqueados (usuario_id, plot_twist_id, ciclo_numero)
  values (v_uid, p_catalogo_id, v_ciclo)
  returning id into v_nuevo;

  return v_nuevo;
end;
$$;

grant execute on function comprar_plot_twist(uuid) to authenticated;
grant execute on function precio_plot_twist_tienda() to authenticated;


-- >>>>>>>>>>>>>>>>>>>>  20260101001700_perfil_social.sql  <<<<<<<<<<<<<<<<<<<<
-- Cuentas sociales (Google / Discord) y teléfono: el trigger que crea el perfil ahora
-- toma el nombre de los metadatos del proveedor si no viene 'nombre' explícito.
-- Función nueva pedida por el usuario (login con Google / Discord / teléfono).

create or replace function crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text;
begin
  v_nombre := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nombre'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(new.raw_user_meta_data->>'preferred_username'), ''),
    'Jugador'
  );
  -- Si el nombre trae apellidos, quedarse con el primero.
  v_nombre := split_part(v_nombre, ' ', 1);

  insert into public.usuarios (id, nombre, confirmo_mayor_edad)
  values (
    new.id,
    left(v_nombre, 40),
    coalesce((new.raw_user_meta_data->>'confirmo_mayor_edad')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


