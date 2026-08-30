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
