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

-- Confirmar que una carta jugada se cumplió (sección 4.3).
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
  if v_carta.jugada_hacia_usuario_id <> v_uid then raise exception 'NO_ERES_RECEPTOR'; end if;
  if v_carta.estado <> 'jugada' then raise exception 'CARTA_NO_JUGADA'; end if;

  update cartas_asignadas
    set estado = 'cumplida', fecha_cumplida = now()
  where id = p_carta_asignada_id;

  v_ciclo := v_carta.ciclo_numero;

  -- Los puntos los gana el dueño original de la carta (quien propuso el reto).
  insert into puntos_semanales (usuario_id, pareja_id, ciclo_numero, puntos)
  values (v_carta.usuario_id, v_carta.pareja_id, v_ciclo, v_puntos)
  on conflict (usuario_id, ciclo_numero)
  do update set puntos = puntos_semanales.puntos + v_puntos;

  select texto into v_texto from catalogo_cartas where id = v_carta.carta_id;

  insert into historial_eventos (pareja_id, usuario_id, tipo_evento, referencia_id, descripcion)
  values (
    v_carta.pareja_id,
    v_carta.usuario_id,
    'carta_cumplida',
    p_carta_asignada_id,
    coalesce(v_texto, 'Carta cumplida')
  );

  perform evaluar_plot_twists(v_carta.usuario_id, v_carta.pareja_id, v_ciclo);
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
