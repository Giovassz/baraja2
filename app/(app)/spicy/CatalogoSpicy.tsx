// Catálogo Spicy jugable: cada carta se abre y se juega hacia la pareja con animación
// Implementa BJ2-032
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CartaJuego } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { jugarCartaSpicy } from '@/lib/actions/spicy';

export function CatalogoSpicy({
  cartas,
  nombreCompanero,
}: {
  cartas: { id: string; texto: string }[];
  nombreCompanero?: string;
}) {
  const router = useRouter();
  const [activa, setActiva] = useState<{ id: string; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  function jugar(id: string) {
    setError(null);
    iniciar(async () => {
      const r = await jugarCartaSpicy(id);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo jugar la carta.');
        return;
      }
      setSaliendo(true);
      celebrar();
      setTimeout(() => {
        setActiva(null);
        setSaliendo(false);
        router.refresh();
      }, 620);
    });
  }

  if (cartas.length === 0) {
    return (
      <p className="text-sm text-white/60">
        Todavía no hay cartas Spicy cargadas para su modalidad.
      </p>
    );
  }

  return (
    <>
      <Corazones />
      <div className="grid grid-cols-3 gap-2.5">
        {cartas.map((c, i) => (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => setActiva(c)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -6, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-naipe outline-none focus-visible:ring-4 focus-visible:ring-rosa-acento/40"
          >
            <CartaJuego id={c.id} texto={c.texto} tipo="spicy" compacta />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activa && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pendiente && setActiva(null)}
          >
            <motion.div
              className="w-full max-w-[270px]"
              initial={{ scale: 0.82, y: 40, rotate: -5 }}
              animate={
                saliendo
                  ? { scale: 1.1, y: -120, rotate: 12, opacity: 0 }
                  : { scale: 1, y: 0, rotate: 0, opacity: 1 }
              }
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CartaJuego id={activa.id} texto={activa.texto} tipo="spicy" />
              <div className="mt-3 flex flex-col gap-2">
                <button
                  className="boton-primario w-full py-2.5 text-sm"
                  disabled={pendiente}
                  onClick={() => jugar(activa.id)}
                >
                  <Icono.llama className="h-4 w-4" strokeWidth={2.5} />
                  {pendiente
                    ? 'Jugando…'
                    : nombreCompanero
                      ? `Jugar con ${nombreCompanero}`
                      : 'Jugar esta carta'}
                </button>
                <button
                  className="w-full rounded-full border-2 border-white/35 bg-white/10 py-2 font-heading text-sm font-semibold text-white transition active:scale-95"
                  onClick={() => setActiva(null)}
                >
                  Volver
                </button>
                {error && <p className="text-center text-xs text-white">{error}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
