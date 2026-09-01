// Barra superior: espacio, nivel de pareja y TUS puntos (moneda de la Tienda)
// Fixed a todo el ancho de la pantalla (antes solo cubría el centro, hasta max-w-2xl,
// dejando ver el fondo a los lados en pantallas anchas) y respeta el notch/status bar.
// Implementa BJ2-014, BJ2-026
import Link from 'next/link';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';
import { Icono } from '@/components/ui/iconos';

export function BarraSuperior({
  nombreEspacio,
  nivel,
  puntos,
}: {
  nombreEspacio: string;
  nivel: number;
  puntos: number;
}) {
  return (
    <header
      className="chrome-oscuro fixed inset-x-0 top-0 z-40 border-b"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <span className="relative shrink-0">
            <LogoBaraja2 tamano={32} />
            <Icono.corazones
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-noche p-0.5 text-rosa-acento"
              strokeWidth={2.5}
            />
          </span>
          <div className="min-w-0 leading-none">
            <p className="truncate font-heading text-base font-semibold text-white">
              {nombreEspacio}
            </p>
            <span className="chip mt-1 !bg-rosa-acento/15 !py-0.5 !text-rosa-acento">
              <Icono.nivel className="h-2.5 w-2.5" strokeWidth={2.5} />
              Nivel {nivel}
            </span>
          </div>
        </Link>

        <Link
          href="/tienda"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-rosa-acento to-coral px-3.5 py-1.5 font-heading text-sm font-bold text-white shadow-[0_6px_18px_-6px_rgba(232,93,138,0.8)] transition active:scale-95"
          title="Tus puntos"
        >
          <Icono.moneda className="h-4 w-4" strokeWidth={2.5} />
          {puntos}
        </Link>
      </div>
    </header>
  );
}
