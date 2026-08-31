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
