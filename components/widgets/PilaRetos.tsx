// Pila de retos recibidos, estilo Tinder: carta grande al frente, siguientes asomando.
// Botón ✕ = ver el siguiente · botón ♥ = cumplir el reto (con animación de swipe).
// Implementa BJ2-020
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Icono } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { presentacionCarta } from '@/lib/reglas/carta';
import { confirmarCumplida } from '@/lib/actions/cartas';
import type { EstadoCarta } from '@/lib/supabase/tipos';

export interface RetoRecibido {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  puntosOtorgados: number;
  estado: EstadoCarta;
}

export function PilaRetos({
  retos,
  nombreCompanero,
}: {
  retos: RetoRecibido[];
  nombreCompanero?: string;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<'cumplida' | 'skip' | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  const total = retos.length;
  const actual = retos[i % total];
  const pr = presentacionCarta(actual.id, actual.tipo, actual.puntosOtorgados);
  const Ico = Icono[pr.icono];

  function siguiente() {
    setDir('skip');
    setTimeout(() => {
      setDir(null);
      setI((v) => (v + 1) % total);
    }, 260);
  }

  function cumplir() {
    setError(null);
    iniciar(async () => {
      const r = await confirmarCumplida(actual.id);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo confirmar.');
        return;
      }
      setDir('cumplida');
      celebrar();
      setTimeout(() => router.refresh(), 520);
    });
  }

  return (
    <div className="relative flex flex-col items-center">
      <Corazones />
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="lane-titulo !bg-rosa-acento">
          <Icono.sobre className="h-3 w-3" strokeWidth={2.5} />
          Retos de {nombreCompanero ?? 'tu pareja'}
        </span>
        {total > 1 && (
          <span className="text-xs font-bold text-white/50">
            {(i % total) + 1}/{total}
          </span>
        )}
      </div>

      <div className="relative mx-auto h-[300px] w-full max-w-[280px]">
        {/* cartas de atrás asomando */}
        {total > 1 && (
          <div className="absolute inset-x-3 top-2 h-full rounded-naipe border border-white/10 bg-white/[0.05]" />
        )}
        {total > 2 && (
          <div className="absolute inset-x-6 top-4 h-full rounded-naipe border border-white/[0.06] bg-white/[0.03]" />
        )}

        <AnimatePresence mode="popLayout">
          <motion.div
            key={actual.id}
            className="carta absolute inset-0"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={
              dir === 'cumplida'
                ? { x: 360, rotate: 18, opacity: 0 }
                : dir === 'skip'
                  ? { x: -300, rotate: -14, opacity: 0 }
                  : { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }
            }
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className={`${actual.tipo === 'spicy' ? 'banda-spicy' : 'banda-estandar'} flex items-center justify-between px-4 py-2.5`}>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                {actual.tipo === 'spicy' ? 'Reto Spicy' : 'Reto'}
              </span>
              <span className="flex gap-1">
                {[1, 2, 3].map((k) => (
                  <span
                    key={k}
                    className={`h-1.5 w-1.5 rounded-full ${k <= pr.nivel ? 'bg-white' : 'bg-white/25'}`}
                  />
                ))}
              </span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rosa-acento to-coral text-white shadow-[0_16px_36px_-10px_rgba(232,93,138,0.7)]">
                <Ico className="h-9 w-9" strokeWidth={2} />
              </span>
              <p className="font-heading text-base font-semibold leading-snug text-white text-balance">
                {actual.texto}
              </p>
              <p className="text-xs text-white/45">
                {nombreCompanero ?? 'Tu pareja'} te retó — cuando lo cumplas, gana el punto.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Acciones flotantes estilo Tinder */}
      <div className="relative z-20 mt-5 flex items-center justify-center gap-5">
        {total > 1 && (
          <button
            onClick={siguiente}
            disabled={pendiente}
            aria-label="Ver el siguiente reto"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-noche-2 text-white/70 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.7)] transition active:scale-90 disabled:opacity-40"
          >
            <Icono.cerrar className="h-6 w-6" strokeWidth={2.5} />
          </button>
        )}
        <button
          onClick={cumplir}
          disabled={pendiente || actual.estado !== 'jugada'}
          aria-label="Marcar como cumplida"
          className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-gradient-to-br from-rosa-acento to-coral text-white shadow-[0_18px_44px_-8px_rgba(232,93,138,0.85)] transition active:scale-90 disabled:opacity-50"
        >
          <Icono.corazon className="h-9 w-9" strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-white/45">
        {pendiente ? 'Confirmando…' : 'Toca el corazón cuando lo hayan cumplido'}
      </p>

      {error && <p className="mt-1 text-center text-xs text-rosa-acento">{error}</p>}
    </div>
  );
}
