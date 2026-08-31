// Lista de correos con acceso al panel oculto /admin (variable de entorno ADMIN_EMAILS,
// separados por coma). No se guarda en la base de datos: es solo para decidir quién ve
// y quién puede tocar el panel de testers.
export function esCorreoAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const lista = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.trim().toLowerCase());
}
