// Barra superior: nombre del espacio, nivel de pareja y TUS puntos (moneda para la Tienda)
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
    <header className="chrome-oscuro sticky top-0 z-40 mx-auto flex max-w-2xl items-center justify-between gap-3 border-b px-4 py-2.5">
      <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
        <LogoBaraja2 tamano={30} />
        <span className="truncate font-heading text-base font-semibold text-white">
          {nombreEspacio}
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <span className="chip-oscuro" title={`Nivel de pareja ${nivel}`}>
          <Icono.nivel className="h-3 w-3" strokeWidth={2.5} />
          Nv {nivel}
        </span>
        <Link
          href="/tienda"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rosa-acento to-vino-marca px-3 py-1.5 font-heading text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(232,93,138,0.7)]"
          title="Tus puntos"
        >
          <Icono.moneda className="h-4 w-4" strokeWidth={2.5} />
          {puntos}
        </Link>
      </div>
    </header>
  );
}
