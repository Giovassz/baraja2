// Layout del panel oculto /admin: exige ser correo admin UNA vez aquí (antes se
// repetía en cada page.tsx) y monta la barra lateral de navegación entre secciones.
import { notFound } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esCorreoAdmin } from '@/lib/admin';
import { SidebarAdmin } from './SidebarAdmin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual(); // exige sesión; redirige a /login si no hay
  if (!esCorreoAdmin(usuario.email)) notFound();

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col sm:flex-row">
      <SidebarAdmin />
      <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
