-- Arregla "Baraja nueva" (tester): antes dejaba fuera las cartas 'bloqueada' y
-- 'robada' porque plot_twists_desbloqueados.carta_objetivo_id las referencia por
-- llave foránea y borrarlas tronaba. Ahora sí se reemplazan: se limpia esa
-- referencia primero (el plot twist ya se usó, solo se pierde el rastro de cuál
-- carta exacta tocó) y luego se borra la carta como las demás.
create or replace function repartir_baraja_tester()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pareja uuid;
  v_tester boolean;
  v_ciclo integer;
  v_reemplazables uuid[];
  v_cuantas integer;
begin
  select pareja_id, coalesce(modo_tester, false)
    into v_pareja, v_tester
  from usuarios where id = v_uid;

  if v_pareja is null then raise exception 'SIN_PAREJA'; end if;
  if not v_tester then raise exception 'MODO_TESTER_INACTIVO'; end if;

  v_ciclo := ciclo_actual(v_pareja);

  select array_agg(id) into v_reemplazables
  from cartas_asignadas
  where usuario_id = v_uid and ciclo_numero = v_ciclo
    and estado in ('disponible', 'cumplida', 'bloqueada', 'robada');

  v_cuantas := coalesce(array_length(v_reemplazables, 1), 0);
  if v_cuantas = 0 then
    raise exception 'SIN_CARTAS_DISPONIBLES';
  end if;

  -- Suelta la referencia desde los plot twists que apuntaban a estas cartas, para
  -- poder borrarlas sin tronar por la llave foránea.
  update plot_twists_desbloqueados
    set carta_objetivo_id = null
  where carta_objetivo_id = any(v_reemplazables);

  delete from cartas_asignadas where id = any(v_reemplazables);

  perform asignar_cartas(v_uid, v_pareja, v_ciclo, v_cuantas, '{}'::uuid[]);

  return v_cuantas;
end;
$$;
