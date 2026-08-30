// Encabezado reutilizable de las páginas internas: enlace "volver" + título con ícono
// Implementa BJ2-002
import Link from 'next/link';
import { Icono, type LucideIcon } from './iconos';

export function EnlaceVolver({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-morado-marca/60 transition hover:text-rosa-acento"
    >
      <Icono.atras className="h-4 w-4" strokeWidth={2.5} />
      Volver
    </Link>
  );
}

export function TituloPagina({
  icono: Ico,
  children,
  subtitulo,
}: {
  icono: LucideIcon;
  children: React.ReactNode;
  subtitulo?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-rosa-acento/15 p-2 text-rosa-acento">
          <Ico className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <h1 className="text-2xl">{children}</h1>
      </div>
      {subtitulo && <p className="text-sm text-morado-marca/70">{subtitulo}</p>}
    </header>
  );
}
