// Shell de la app autenticada (sección 2). Sin dock inferior (eso es Fase 11, no aprobada).
import Link from 'next/link';
import { exigirParejaVinculada, obtenerUsuarioActual } from '@/lib/datos';
import { cerrarSesion } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/Avatar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-lavanda/40 bg-blanco-calido/85 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-heading text-xl">🃏</span>
          <span className="font-heading text-lg text-morado-marca">
            {pareja.nombre_espacio ?? 'Baraja2'}
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link href="/historial" className="rounded-full px-3 py-1 font-semibold text-morado-marca/70 hover:bg-lavanda/30">
            Historial
          </Link>
          <Link href="/ajustes/notificaciones" className="rounded-full px-3 py-1 font-semibold text-morado-marca/70 hover:bg-lavanda/30">
            Ajustes
          </Link>
          <form action={cerrarSesion}>
            <button className="rounded-full px-2 py-1" title="Cerrar sesión">
              <Avatar avatarId={usuario.avatar_id} nombre={usuario.nombre} tamano={32} />
            </button>
          </form>
        </nav>
      </header>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
