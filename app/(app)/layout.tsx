// Shell de la app autenticada (sección 2). Sin dock inferior (eso es Fase 11, no aprobada).
import Link from 'next/link';
import { exigirParejaVinculada, obtenerUsuarioActual } from '@/lib/datos';
import { cerrarSesion } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/Avatar';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';
import { Icono } from '@/components/ui/iconos';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="vidrio sticky top-0 z-30 flex items-center justify-between gap-3 border-x-0 border-t-0 px-4 py-3">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <LogoBaraja2 tamano={34} />
          <span className="truncate font-heading text-lg text-morado-marca">
            {pareja.nombre_espacio ?? 'Baraja2'}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/historial"
            aria-label="Historial"
            className="rounded-full p-2 text-morado-marca/70 transition hover:bg-lavanda/30 hover:text-rosa-acento"
          >
            <Icono.reloj className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <Link
            href="/ajustes/notificaciones"
            aria-label="Ajustes"
            className="rounded-full p-2 text-morado-marca/70 transition hover:bg-lavanda/30 hover:text-rosa-acento"
          >
            <Icono.ajustes className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <form action={cerrarSesion}>
            <button className="ml-1 flex items-center rounded-full" title="Cerrar sesión">
              <Avatar avatarId={usuario.avatar_id} nombre={usuario.nombre} tamano={32} />
            </button>
          </form>
        </nav>
      </header>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
