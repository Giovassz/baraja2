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
