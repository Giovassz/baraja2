// Naipe de póker: marco de carta con índices de esquina, marca de agua de palo y
// slot central. Base visual del rediseño de las cartas de Baraja2.
// Implementa BJ2-017
'use client';

import { Icono, type LucideIcon } from './iconos';
import type { CaraNaipe, Palo } from '@/lib/reglas/naipe';

const ICONO_PALO: Record<Palo, LucideIcon> = {
  corazon: Icono.corazon,
  rombo: Icono.rombo,
  trebol: Icono.trebol,
  pica: Icono.pica,
};

function IndiceEsquina({
  cara,
  invertido = false,
  spicy = false,
}: {
  cara: CaraNaipe;
  invertido?: boolean;
  spicy?: boolean;
}) {
  const IconoPalo = ICONO_PALO[cara.palo];
  const color = spicy
    ? 'text-rosa-acento'
    : cara.rojo
      ? 'text-rosa-acento'
      : 'text-morado-marca';
  return (
    <div
      className={`flex flex-col items-center leading-none ${color} ${
        invertido ? 'rotate-180' : ''
      }`}
    >
      <span className="font-naipe text-lg font-bold sm:text-xl">{cara.valor}</span>
      <IconoPalo className="h-3.5 w-3.5" strokeWidth={2.5} fill="currentColor" />
    </div>
  );
}

interface NaipeProps {
  cara: CaraNaipe;
  children?: React.ReactNode;
  /** Muestra el reverso de la baraja en lugar de la cara. */
  reverso?: boolean;
  reversoColor?: 'rosa' | 'azul';
  spicy?: boolean;
  atenuado?: boolean;
  className?: string;
}

export function Naipe({
  cara,
  children,
  reverso = false,
  reversoColor = 'rosa',
  spicy = false,
  atenuado = false,
  className = '',
}: NaipeProps) {
  if (reverso) {
    return (
      <div
        className={`naipe naipe-reverso ${
          reversoColor === 'azul' ? 'naipe-reverso-azul' : ''
        } ${className}`}
      >
        <div className="m-2 flex-1 rounded-[10px] border-2 border-white/70" />
      </div>
    );
  }

  const IconoPalo = ICONO_PALO[cara.palo];

  return (
    <div
      className={`naipe ${spicy ? 'ring-rosa-acento/40' : ''} ${
        atenuado ? 'opacity-60 saturate-50' : ''
      } ${className}`}
    >
      {/* Marca de agua del palo */}
      <IconoPalo
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 ${
          spicy || cara.rojo ? 'text-rosa-acento/[0.07]' : 'text-morado-marca/[0.05]'
        }`}
        fill="currentColor"
        strokeWidth={0}
      />

      {/* Esquinas */}
      <div className="absolute left-1.5 top-1.5">
        <IndiceEsquina cara={cara} spicy={spicy} />
      </div>
      <div className="absolute bottom-1.5 right-1.5">
        <IndiceEsquina cara={cara} spicy={spicy} invertido />
      </div>

      {/* Contenido central */}
      <div className="relative z-10 flex flex-1 flex-col px-4 py-6">{children}</div>
    </div>
  );
}
