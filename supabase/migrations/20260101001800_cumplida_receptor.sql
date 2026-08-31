-- Cambia el flujo de "cumplir un reto" (sección 4.3) a dos pasos, para que nadie se
-- autootorgue su propio punto:
--   1) el receptor toca el corazón para avisar "ya lo hice" (reclamar_cumplida).
--   2) quien mandó la carta confirma que sí se cumplió (confirmar_cumplida) y ahí
--      se otorga el punto — a quien lo cumplió (el receptor), no a quien lo mandó.
-- Antes: el receptor se autoconfirmaba de un tiro y el punto se lo llevaba quien
-- mandó la carta.

alter table cartas_asignadas
  add column if not exists reclamada_en timestamptz;

-- Paso 1: el receptor avisa que ya cumplió el reto en la vida real.
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

-- Paso 2: quien mandó la carta confirma que sí se cumplió; el punto es para el receptor.
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
