-- Activar/desactivar cuentas desde /admin (sección Usuarios): alternativa segura a
-- eliminar — eliminarUsuario ya falla a propósito para cuentas con actividad de
-- juego (cartas_asignadas, puntos_semanales, etc. no tienen "on delete cascade").
-- Desactivar en cambio solo bloquea el acceso (ver obtenerUsuarioActual en
-- lib/datos.ts), sin tocar ni una fila de su historial.

alter table public.usuarios
  add column if not exists cuenta_activa boolean not null default true;
