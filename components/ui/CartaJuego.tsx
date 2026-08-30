// Carta de juego con estructura estilo TCG (Pokémon): marco de color, ventana de arte,
// cabecera con tipo y nivel, panel de efecto con el texto del reto.
// Implementa BJ2-017
'use client';

import { motion } from 'framer-motion';
import { Icono } from './iconos';
import type { NombreIconoCarta } from './iconos';
import { presentacionCarta, type AcentoCarta } from '@/lib/reglas/carta';
import type { EstadoCarta } from '@/lib/supabase/tipos';

const MARCO: Record<AcentoCarta, string> = {
  estandar: 'marco-estandar',
  spicy: 'marco-spicy',
  plot: 'marco-plot',
};
const ETIQUETA_TIPO: Record<AcentoCarta, string> = {
  estandar: 'Reto',
  spicy: 'Spicy',
  plot: 'Plot twist',
};
const ICONO_ARTE: Record<AcentoCarta, string> = {
  estandar: 'text-rosa-acento',
  spicy: 'text-coral',
  plot: 'text-[#c9b4ec]',
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
    <div className={`carta ${MARCO[acento]} ${atenuado ? 'opacity-60 saturate-50' : ''} ${className}`}>
      <div className={`carta-inner ${compacta ? 'gap-1 p-1.5' : 'gap-2 p-2.5'}`}>
        {/* Cabecera: tipo + nivel */}
        <div className="flex items-center justify-between px-0.5">
          <span
            className={`font-heading font-extrabold uppercase tracking-wider text-white ${
              compacta ? 'text-[8px]' : 'text-[11px]'
            }`}
          >
            {ETIQUETA_TIPO[acento]}
          </span>
          {nivel && (
            <span className="flex gap-0.5" title={nombreNivel}>
              {[1, 2, 3].map((n) => (
                <Icono.estrella
                  key={n}
                  className={compacta ? 'h-2 w-2' : 'h-2.5 w-2.5'}
                  strokeWidth={2}
                  fill={n <= nivel ? 'currentColor' : 'none'}
                  color={n <= nivel ? '#ffd25e' : 'rgba(255,255,255,0.3)'}
                />
              ))}
            </span>
          )}
        </div>

        {/* Ventana de arte */}
        <div className={`ventana-arte ${compacta ? 'flex-1' : 'h-[42%]'}`}>
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            className={ICONO_ARTE[acento]}
          >
            <Ico
              className={compacta ? 'h-9 w-9' : 'h-12 w-12'}
              strokeWidth={1.8}
            />
          </motion.span>
          {estado && ETIQUETA_ESTADO[estado] && (
            <span
              className={`absolute right-1 top-1 rounded-full bg-noche-2/90 text-white ring-1 ring-white/20 ${
                compacta ? 'p-0.5' : 'p-1'
              }`}
            >
              {estado === 'cumplida' ? (
                <Icono.check className={compacta ? 'h-2 w-2' : 'h-3 w-3'} strokeWidth={3.5} />
              ) : estado === 'jugada' ? (
                <Icono.reloj className={compacta ? 'h-2 w-2' : 'h-3 w-3'} strokeWidth={3} />
              ) : (
                <Icono.candado className={compacta ? 'h-2 w-2' : 'h-3 w-3'} strokeWidth={3} />
              )}
            </span>
          )}
        </div>

        {/* Panel de efecto: el texto del reto (solo carta grande) */}
        {compacta ? (
          <p className="line-clamp-2 px-0.5 text-center text-[9px] font-semibold leading-tight text-white/85">
            {texto}
          </p>
        ) : (
          <div className="panel-efecto flex flex-1 items-center justify-center">
            <p className="line-clamp-5 font-body text-[12px] font-semibold leading-snug text-white/95 text-balance">
              {texto}
            </p>
          </div>
        )}

        {/* Pie */}
        {!compacta && (
          <div className="flex items-center justify-between px-1 text-[9px] font-bold uppercase tracking-wider text-white/40">
            <span>{nombreNivel ?? 'Baraja2'}</span>
            <Icono.corazon className="h-2.5 w-2.5 text-rosa-acento" fill="currentColor" strokeWidth={0} />
          </div>
        )}
      </div>
    </div>
  );
}
