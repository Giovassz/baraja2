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
