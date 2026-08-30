// Carta de juego (rediseño "picante"): sin número, con ícono, nombre y nivel.
// Banda de color según el tipo (estándar / spicy / plot twist).
// Implementa BJ2-017
'use client';

import { motion } from 'framer-motion';
import { Icono } from './iconos';
import type { NombreIconoCarta } from './iconos';
import { presentacionCarta, type AcentoCarta } from '@/lib/reglas/carta';
import type { EstadoCarta } from '@/lib/supabase/tipos';

const BANDA: Record<AcentoCarta, string> = {
  estandar: 'banda-estandar',
  spicy: 'banda-spicy',
  plot: 'banda-plot',
};
const ETIQUETA_TIPO: Record<AcentoCarta, string> = {
  estandar: 'Reto',
  spicy: 'Spicy',
  plot: 'Plot twist',
};
const CIRCULO: Record<AcentoCarta, string> = {
  estandar: 'bg-rosa-acento text-white',
  spicy: 'bg-gradient-to-br from-vino-marca to-morado-marca text-white',
  plot: 'bg-gradient-to-br from-[#6b4a86] to-morado-marca text-white',
};
const ETIQUETA_ESTADO: Partial<Record<EstadoCarta, string>> = {
  jugada: 'En juego',
  cumplida: 'Cumplida',
  bloqueada: 'Bloqueada',
  robada: 'Robada',
};

interface CartaJuegoProps {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  puntosOtorgados?: number;
  estado?: EstadoCarta;
  compacta?: boolean;
  className?: string;
}

export function CartaJuego({
  id,
  texto,
  tipo,
  puntosOtorgados = 1,
  estado,
  compacta = false,
  className = '',
}: CartaJuegoProps) {
  const p = presentacionCarta(id, tipo, puntosOtorgados);
  return (
    <CaraCarta
      icono={p.icono}
      acento={p.acento}
      nivel={p.nivel}
      nombreNivel={p.nombreNivel}
      texto={texto}
      estado={estado}
      compacta={compacta}
      className={className}
    />
  );
}

export function CaraCarta({
  icono,
  acento,
  nivel,
  nombreNivel,
  texto,
  estado,
  compacta = false,
  className = '',
}: {
  icono: NombreIconoCarta;
  acento: AcentoCarta;
  nivel?: 1 | 2 | 3;
  nombreNivel?: string;
  texto: string;
  estado?: EstadoCarta;
  compacta?: boolean;
  className?: string;
}) {
  const Ico = Icono[icono];
  const atenuado = estado === 'bloqueada' || estado === 'robada';

  return (
    <div className={`carta ${atenuado ? 'opacity-60 saturate-50' : ''} ${className}`}>
      {/* Banda superior */}
      <div className={`${BANDA[acento]} flex items-center justify-between px-3 py-2`}>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white">
          {ETIQUETA_TIPO[acento]}
        </span>
        {nivel && (
          <span className="flex gap-1" title={nombreNivel}>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1.5 w-1.5 rounded-full ${n <= nivel ? 'bg-white' : 'bg-white/25'}`}
              />
            ))}
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-2 px-3 text-center ${
          compacta ? 'py-2.5' : 'py-5'
        }`}
      >
        <motion.span
          className={`flex items-center justify-center rounded-full shadow-[0_8px_18px_-6px_rgba(232,93,138,0.55)] ${CIRCULO[acento]} ${
            compacta ? 'h-10 w-10' : 'h-16 w-16'
          }`}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Ico className={compacta ? 'h-4 w-4' : 'h-7 w-7'} strokeWidth={2.2} />
        </motion.span>

        <p
          className={`font-heading font-semibold leading-tight text-morado-marca text-balance ${
            compacta ? 'line-clamp-3 text-[11px]' : 'text-[15px]'
          }`}
        >
          {texto}
        </p>

        {estado && ETIQUETA_ESTADO[estado] && !compacta && (
          <span className="chip">{ETIQUETA_ESTADO[estado]}</span>
        )}
      </div>

      {estado && ETIQUETA_ESTADO[estado] && compacta && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1 text-morado-marca shadow-widget-sm">
          {estado === 'cumplida' ? (
            <Icono.check className="h-2.5 w-2.5" strokeWidth={3.5} />
          ) : estado === 'jugada' ? (
            <Icono.reloj className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            <Icono.candado className="h-2.5 w-2.5" strokeWidth={3} />
          )}
        </span>
      )}
    </div>
  );
}
