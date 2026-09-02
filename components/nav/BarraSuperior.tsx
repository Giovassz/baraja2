// Barra superior: espacio, nivel de pareja (con su barra de progreso) y TUS puntos.
// Ahora es una tarjeta flotante con esquinas redondeadas y un brillo animado
// (antes era un rectángulo pegado de borde a borde, sin margen ni esquinas).
// Implementa BJ2-014, BJ2-026
import Link from 'next/link';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';
import { Icono } from '@/components/ui/iconos';

export function BarraSuperior({
  nombreEspacio,
  nivel,
  progreso,
  puntos,
}: {
  nombreEspacio: string;
  nivel: number;
  /** Progreso 0..1 dentro del nivel actual. */
  progreso: number;
  puntos: number;
}) {
  const progresoPct = Math.round(Math.max(0, Math.min(1, progreso)) * 100);

  return (
    <header
      className="chrome-oscuro destello fixed left-3 right-3 z-40 overflow-hidden rounded-[26px] border shadow-[0_14px_34px_-16px_rgba(0,0,0,0.8)]"
      style={{ top: 'calc(12px + env(safe-area-inset-top))' }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="relative shrink-0">
            <LogoBaraja2 tamano={34} />
            <Icono.corazones
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-noche p-0.5 text-rosa-acento"
              strokeWidth={2.5}
            />
          </span>
          <div className="min-w-0 leading-none">
            <p className="truncate font-heading text-base font-bold text-white">
              {nombreEspacio}
            </p>
            <span className="chip mt-1.5 !bg-rosa-acento/15 !py-0.5 !text-rosa-acento">
              <Icono.nivel className="h-2.5 w-2.5" strokeWidth={2.5} />
              Nivel {nivel}
            </span>
            <div className="mt-1.5 h-1 w-24 max-w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rosa-acento to-coral transition-[width] duration-700 ease-out"
                style={{ width: `${progresoPct}%` }}
              />
            </div>
          </div>
        </Link>

        <Link
          href="/tienda"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-rosa-acento to-coral px-3.5 py-1.5 font-heading text-sm font-bold text-white shadow-[0_6px_18px_-6px_rgb(var(--c-acento)/0.8)] transition active:scale-95"
          title="Tus puntos"
        >
          <Icono.estrella className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
          {puntos}
        </Link>
      </div>
    </header>
  );
}
