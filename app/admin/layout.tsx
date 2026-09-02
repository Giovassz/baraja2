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
    // En pantallas >= sm se fija a la altura del viewport y cada columna (sidebar,
    // contenido) hace su propio scroll — igual que un dashboard de escritorio. En
    // celular se deja el scroll normal de la página (más simple y ya funcionaba).
    <div className="admin-shell flex min-h-dvh flex-col sm:h-dvh sm:overflow-hidden">
      <BarraSuperiorAdmin email={usuario.email} />
      {/* Sin mx-auto/max-width aquí: el sidebar queda pegado a la izquierda y el
          contenido ocupa el 100% del ancho restante en CUALQUIER pantalla — nada de
          franjas vacías. Cada página limita el ancho de sus propias tarjetas con
          grillas fluidas (auto-fit), no esta fila. */}
      <div className="flex w-full flex-1 flex-col sm:flex-row sm:overflow-hidden">
        <SidebarAdmin email={usuario.email} />
        <main className="min-w-0 flex-1 p-4 sm:overflow-y-auto sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
