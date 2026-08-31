// Revelación en pantalla completa cuando tu pareja te usa un plot twist encima
// (bloquea o roba una de tus cartas). Antes pasaba en silencio; ahora es un momento,
// con animación y un botón "Entendido" que lo marca como visto.
// Implementa BJ2-027, BJ2-028
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CaraCarta } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { marcarPlotTwistVisto } from '@/lib/actions/plot-twists';

export interface CartaPlotTwistRecibido {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  efecto: 'bloqueada' | 'robada';
}

export function RevelacionPlotTwist({
  carta,
  nombreCompanero,
}: {
  carta: CartaPlotTwistRecibido;
  nombreCompanero?: string;
}) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  const [pendiente, iniciar] = useTransition();

  const esRobo = carta.efecto === 'robada';

  function aceptar() {
    iniciar(async () => {
      await marcarPlotTwistVisto(carta.id);
      setSaliendo(true);
      setTimeout(() => router.refresh(), 400);
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-noche/92 p-6 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: saliendo ? 0 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        className="rounded-full p-4 text-white"
        style={{
          background: esRobo
            ? 'linear-gradient(160deg, #c9b4ec, #7d5aa8)'
            : 'linear-gradient(160deg, #ff9d6c, #e85d8a)',
        }}
        initial={{ scale: 0.6, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        {esRobo ? (
          <Icono.mano className="h-8 w-8" strokeWidth={2} />
        ) : (
          <Icono.candado className="h-8 w-8" strokeWidth={2} />
        )}
      </motion.span>

      <div className="text-center">
        <p className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-lavanda">
          Plot twist
        </p>
        <h2 className="mt-1 text-2xl">
          {nombreCompanero ?? 'Tu pareja'} te {esRobo ? 'robó' : 'bloqueó'} una carta
        </h2>
      </div>

      <motion.div
        className="w-full max-w-[240px]"
        initial={{ scale: 0.88, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 22 }}
      >
        <CaraCarta
          icono={esRobo ? 'mano' : 'candado'}
          acento="plot"
          texto={carta.texto}
          compacta={false}
        />
      </motion.div>

      <p className="max-w-xs text-center text-sm text-white/60">
        {esRobo
          ? 'Esa carta ya no es tuya — ahora la puede jugar tu pareja.'
          : 'Esa carta se queda bloqueada por esta semana.'}
      </p>

      <button
        className="boton-primario mt-2 w-full max-w-[240px] py-3 text-sm"
        disabled={pendiente}
        onClick={aceptar}
      >
        <Icono.check className="h-4 w-4" strokeWidth={2.5} />
        {pendiente ? 'Cerrando…' : 'Entendido'}
      </button>
    </motion.div>
  );
}
