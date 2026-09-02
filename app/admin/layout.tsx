// Layout del panel oculto /admin: exige ser correo admin UNA vez aquí (antes se
// repetía en cada page.tsx), monta la barra superior y la barra lateral de
// navegación. Paleta propia (.admin-shell en globals.css) — ver esa clase.
import { notFound } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esCorreoAdmin } from '@/lib/admin';
import { SidebarAdmin } from './SidebarAdmin';
import { BarraSuperiorAdmin } from './BarraSuperiorAdmin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual(); // exige sesión; redirige a /login si no hay
  if (!esCorreoAdmin(usuario.email)) notFound();

  return (
    <div className="admin-shell flex min-h-dvh flex-col">
      <BarraSuperiorAdmin email={usuario.email} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col sm:flex-row">
        <SidebarAdmin email={usuario.email} />
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
