-- "Baraja nueva" para testers (solo Tienda, solo modo_tester): reload normal solo
-- puede cambiar cartas 'disponible' — si ya cumpliste las 5 no tiene nada que
-- cambiar y no sirve. Esto reemplaza también las que ya están 'cumplida' por cartas
-- nuevas, sin esperar los 7 días, para poder seguir probando de una.
-- No toca 'jugada' (le mandaste esa a tu pareja, no se le puede quitar de encima) ni
-- 'bloqueada'/'robada' (tienen un plot twist enganchado por llave foránea).
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
    and estado in ('disponible', 'cumplida');

  v_cuantas := coalesce(array_length(v_reemplazables, 1), 0);
  if v_cuantas = 0 then
    raise exception 'SIN_CARTAS_DISPONIBLES';
  end if;

  delete from cartas_asignadas where id = any(v_reemplazables);

  perform asignar_cartas(v_uid, v_pareja, v_ciclo, v_cuantas, '{}'::uuid[]);

  return v_cuantas;
end;
$$;

grant execute on function repartir_baraja_tester() to authenticated;
