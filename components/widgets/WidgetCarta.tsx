// Widget de una carta = naipe de póker (rediseño). Tarjeta blanca con índices de
// esquina, marca de agua de palo y el reto en el centro; bandeja de acción debajo.
// Implementa BJ2-017, BJ2-018, BJ2-020, BJ2-031
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { jugarCarta, confirmarCumplida } from '@/lib/actions/cartas';
import { jugarCartaSpicy } from '@/lib/actions/spicy';
import { useCelebracion } from '@/components/ui/Celebracion';
import { Naipe } from '@/components/ui/Naipe';
import { Icono } from '@/components/ui/iconos';
import { caraDeNaipe } from '@/lib/reglas/naipe';
import type { EstadoCarta } from '@/lib/supabase/tipos';

export type RolCarta = 'propia' | 'recibida' | 'companero' | 'spicy-catalogo';

interface WidgetCartaProps {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  estado?: EstadoCarta;
  rol: RolCarta;
  nombreCompanero?: string;
  /** índice dentro de la mano, para escalonar la animación de reparto */
  indice?: number;
}

const ETIQUETA_ESTADO: Partial<Record<EstadoCarta, string>> = {
  jugada: 'En juego',
  cumplida: 'Cumplida',
  bloqueada: 'Bloqueada',
  robada: 'Robada',
};

type Resultado = { ok: boolean; error?: string; mensaje?: string };

export function WidgetCarta({
  id,
  texto,
  tipo,
  estado,
  rol,
  nombreCompanero,
  indice = 0,
}: WidgetCartaProps) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  const cara = caraDeNaipe(id, tipo);
  const spicy = tipo === 'spicy';
  const atenuado = estado === 'bloqueada' || estado === 'robada';

  function ejecutar(fn: () => Promise<Resultado>, celebra = false) {
    setError(null);
    iniciar(async () => {
      const r = await fn();
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo completar la acción.');
        return;
      }
      if (celebra) celebrar();
      router.refresh();
    });
  }

  const puedeJugar = rol === 'propia' && estado === 'disponible';
  const puedeConfirmar = rol === 'recibida' && estado === 'jugada';
  const puedeJugarSpicy = rol === 'spicy-catalogo';

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, rotate: -6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.45, delay: indice * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="flex flex-col gap-2"
    >
      <div className="relative">
        <Corazones />
        <Naipe cara={cara} spicy={spicy} atenuado={atenuado}>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            {spicy && (
              <span className="chip bg-rosa-acento/15 text-rosa-acento">
                <Icono.llama className="h-3 w-3" strokeWidth={2.5} /> Spicy
              </span>
            )}
            {estado && ETIQUETA_ESTADO[estado] && (
              <span className="chip">
                {estado === 'cumplida' && (
                  <Icono.cumplida className="h-3 w-3" strokeWidth={2.5} />
                )}
                {ETIQUETA_ESTADO[estado]}
              </span>
            )}
            <p className="font-body text-[15px] font-semibold leading-snug text-morado-marca text-balance">
              {texto}
            </p>
          </div>
        </Naipe>
      </div>

      {/* Bandeja de acción */}
      {(puedeJugar || puedeConfirmar || puedeJugarSpicy || error) && (
        <div className="flex flex-col gap-1">
          {puedeJugar && (
            <button
              className="boton-primario w-full py-2 text-sm"
              disabled={pendiente}
              onClick={() => ejecutar(() => jugarCarta(id))}
            >
              <Icono.jugar className="h-4 w-4" strokeWidth={2.5} />
              {pendiente ? 'Jugando…' : nombreCompanero ? `Jugar con ${nombreCompanero}` : 'Jugar'}
            </button>
          )}
          {puedeConfirmar && (
            <button
              className="boton-primario w-full py-2 text-sm"
              disabled={pendiente}
              onClick={() => ejecutar(() => confirmarCumplida(id), true)}
            >
              <Icono.cumplida className="h-4 w-4" strokeWidth={2.5} />
              {pendiente ? 'Confirmando…' : 'Cumplida'}
            </button>
          )}
          {puedeJugarSpicy && (
            <button
              className="boton-primario w-full py-2 text-sm"
              disabled={pendiente}
              onClick={() => ejecutar(() => jugarCartaSpicy(id))}
            >
              <Icono.llama className="h-4 w-4" strokeWidth={2.5} />
              {pendiente ? 'Jugando…' : 'Jugar esta carta'}
            </button>
          )}
          {rol === 'propia' && estado === 'jugada' && (
            <p className="text-center text-xs text-morado-marca/60">
              Esperando a que la cumplan…
            </p>
          )}
          {error && <p className="text-center text-xs text-vino-marca">{error}</p>}
        </div>
      )}
    </motion.article>
  );
}
