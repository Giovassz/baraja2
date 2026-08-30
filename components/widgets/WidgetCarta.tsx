// Widget de una carta (sección 5): tarjeta redondeada con gradiente pastel.
// Implementa BJ2-017, BJ2-018, BJ2-020, BJ2-031
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { jugarCarta, confirmarCumplida } from '@/lib/actions/cartas';
import { jugarCartaSpicy } from '@/lib/actions/spicy';
import { useCelebracion } from '@/components/ui/Celebracion';
import type { EstadoCarta } from '@/lib/supabase/tipos';

export type RolCarta = 'propia' | 'recibida' | 'companero' | 'spicy-catalogo';

interface WidgetCartaProps {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  estado?: EstadoCarta;
  rol: RolCarta;
  nombreCompanero?: string;
}

const ESTILO_ESTADO: Record<string, string> = {
  disponible: 'from-rosa-pastel to-blanco-calido',
  jugada: 'from-lavanda to-blanco-calido',
  cumplida: 'from-menta to-blanco-calido',
  bloqueada: 'from-lavanda/60 to-blanco-calido opacity-70',
  robada: 'from-lavanda/60 to-blanco-calido opacity-60',
};

const ETIQUETA_ESTADO: Record<string, string> = {
  disponible: 'Disponible',
  jugada: 'En juego',
  cumplida: 'Cumplida',
  bloqueada: 'Bloqueada',
  robada: 'Robada',
};

export function WidgetCarta({
  id,
  texto,
  tipo,
  estado,
  rol,
  nombreCompanero,
}: WidgetCartaProps) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  const gradiente =
    rol === 'spicy-catalogo'
      ? 'from-rosa-acento/25 to-blanco-calido'
      : ESTILO_ESTADO[estado ?? 'disponible'];

  function ejecutar(fn: () => Promise<{ ok: boolean; error?: string; mensaje?: string }>, celebra = false) {
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

  return (
    <article
      className={`widget flex min-h-[160px] flex-col justify-between bg-gradient-to-br ${gradiente}`}
    >
      <Corazones />
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-vino-marca">
            {tipo === 'spicy' ? '🌶️ Spicy' : 'Carta'}
          </span>
          {estado && rol !== 'spicy-catalogo' && (
            <span className="text-[11px] font-semibold text-morado-marca/60">
              {ETIQUETA_ESTADO[estado]}
            </span>
          )}
        </div>
        <p className="mt-3 font-body text-[15px] leading-snug text-morado-marca">{texto}</p>
      </div>

      {error && <p className="mt-2 text-xs text-vino-marca">{error}</p>}

      <div className="mt-3">
        {rol === 'propia' && estado === 'disponible' && (
          <button
            className="boton-primario w-full py-2 text-sm"
            disabled={pendiente}
            onClick={() => ejecutar(() => jugarCarta(id))}
          >
            {pendiente ? 'Jugando…' : `Jugar${nombreCompanero ? ` con ${nombreCompanero}` : ''}`}
          </button>
        )}

        {rol === 'propia' && estado === 'jugada' && (
          <p className="text-center text-xs text-morado-marca/60">
            Esperando a que la cumplan.
          </p>
        )}

        {rol === 'recibida' && estado === 'jugada' && (
          <button
            className="boton-primario w-full py-2 text-sm"
            disabled={pendiente}
            onClick={() => ejecutar(() => confirmarCumplida(id), true)}
          >
            {pendiente ? 'Confirmando…' : 'Marcar como cumplida'}
          </button>
        )}

        {rol === 'spicy-catalogo' && (
          <button
            className="boton-primario w-full py-2 text-sm"
            disabled={pendiente}
            onClick={() => ejecutar(() => jugarCartaSpicy(id))}
          >
            {pendiente ? 'Jugando…' : 'Jugar esta carta'}
          </button>
        )}
      </div>
    </article>
  );
}
