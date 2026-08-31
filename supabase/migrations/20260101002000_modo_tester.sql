-- Modo tester (para cuentas de prueba, no visible en la UI normal): una bandera por
-- persona que el juego usa para saltarse límites — por ahora, recargas ilimitadas.
-- Se activa/desactiva desde /admin (solo la(s) cuenta(s) en ADMIN_EMAILS).

alter table usuarios
  add column if not exists modo_tester boolean not null default false;

-- Recargar cartas (sección 4.8): igual que antes, pero si modo_tester está activo,
-- no cuenta como el reload de la semana (puede recargar todas las veces que quiera).
create or replace function recargar_cartas()
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
  v_perdidas uuid[];
  v_cuantas integer;
begin
  select pareja_id, coalesce(modo_tester, false)
    into v_pareja, v_tester
  from usuarios where id = v_uid;

  if v_pareja is null then raise exception 'SIN_PAREJA'; end if;

  v_ciclo := ciclo_actual(v_pareja);

  if not v_tester and exists (
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

  if not v_tester then
    insert into reloads_usados (usuario_id, ciclo_numero) values (v_uid, v_ciclo);
  end if;

  return v_cuantas;
end;
$$;
