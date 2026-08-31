// Pila de retos recibidos, estilo Tinder: carta grande al frente, siguientes asomando.
// Solo para verlos — quien confirma que se cumplieron es quien los mandó, desde "Tu mano"
// (ManoFan), no quien los recibe: así el punto no se lo auto-otorga quien hizo el reto.
// Botón ✕ = ver el siguiente, si hay más de uno.
// Implementa BJ2-020
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icono } from '@/components/ui/iconos';
import { presentacionCarta } from '@/lib/reglas/carta';
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
  const [i, setI] = useState(0);
  const [saliendo, setSaliendo] = useState(false);

  const total = retos.length;
  const actual = retos[i % total];
  const pr = presentacionCarta(actual.id, actual.tipo, actual.puntosOtorgados);
  const Ico = Icono[pr.icono];

  function siguiente() {
    setSaliendo(true);
    setTimeout(() => {
      setSaliendo(false);
      setI((v) => (v + 1) % total);
    }, 260);
  }

  return (
    <div className="relative flex flex-col items-center">
      {total > 1 && (
        <span className="mb-1 self-end text-xs font-bold text-white/50">
          {(i % total) + 1}/{total}
        </span>
      )}

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
              saliendo
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
                {nombreCompanero ?? 'Tu pareja'} te retó — cúmplelo y {nombreCompanero ?? 'tu pareja'} te confirma el punto.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {total > 1 && (
        <div className="relative z-20 mt-5 flex items-center justify-center">
          <button
            onClick={siguiente}
            aria-label="Ver el siguiente reto"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-noche-2 text-white/70 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.7)] transition active:scale-90"
          >
            <Icono.siguiente className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-white/45">
        Cuando lo cumplas, tu pareja lo confirma desde su mano y ahí ganas el punto.
      </p>
    </div>
  );
}
