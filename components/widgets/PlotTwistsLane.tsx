// Lane de plot twists en la mesa: cartas moradas que se abren para elegir su objetivo.
// Implementa BJ2-025, BJ2-027, BJ2-028
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CaraCarta } from '@/components/ui/CartaJuego';
import { useCelebracion } from '@/components/ui/Celebracion';
import { presentacionPlotTwist } from '@/lib/reglas/carta';
import { usarPlotTwistBloquear, usarPlotTwistRobar } from '@/lib/actions/plot-twists';

export interface PlotTwistLane {
  id: string;
  nombre: string;
  descripcion: string;
  efecto: 'bloquear_carta' | 'robar_carta' | 'otro';
}
export interface ObjetivoLane {
  id: string;
  texto: string;
}

export function PlotTwistsLane({
  plotTwists,
  objetivos,
}: {
  plotTwists: PlotTwistLane[];
  objetivos: ObjetivoLane[];
}) {
  const router = useRouter();
  const [sel, setSel] = useState<PlotTwistLane | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  if (plotTwists.length === 0) return null;

  function usar(objetivoId: string) {
    if (!sel) return;
    const s = sel;
    setError(null);
    iniciar(async () => {
      const r =
        s.efecto === 'robar_carta'
          ? await usarPlotTwistRobar(s.id, objetivoId)
          : await usarPlotTwistBloquear(s.id, objetivoId);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo usar el plot twist.');
        return;
      }
      setSaliendo(true);
      celebrar();
      setTimeout(() => {
        setSel(null);
        setSaliendo(false);
        router.refresh();
      }, 600);
    });
  }

  return (
    <section className="lane lane-plot">
      <Corazones />
      <div className="grid grid-cols-3 gap-2.5">
        {plotTwists.map((pt, i) => {
          const pr = presentacionPlotTwist(pt.efecto);
          return (
            <motion.button
              key={pt.id}
              type="button"
              onClick={() => setSel(pt)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-naipe outline-none focus-visible:ring-4 focus-visible:ring-[#b39ddb]/40"
            >
              <CaraCarta icono={pr.icono} acento="plot" texto={pt.nombre} compacta />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {sel && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-noche/85 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pendiente && setSel(null)}
          >
            <motion.div
              className="w-full max-w-[260px]"
              initial={{ scale: 0.82, y: 40, rotate: -5 }}
              animate={
                saliendo
                  ? { scale: 1.12, y: -130, rotate: 14, opacity: 0 }
                  : { scale: 1, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CaraCarta
                icono={presentacionPlotTwist(sel.efecto).icono}
                acento="plot"
                texto={sel.nombre}
              />
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-center text-xs text-white/80">{sel.descripcion}</p>
                {objetivos.length === 0 ? (
                  <p className="text-center text-xs text-white/50">
                    Tu pareja no tiene cartas disponibles para este plot twist.
                  </p>
                ) : (
                  <div className="flex max-h-44 flex-col gap-2 overflow-y-auto">
                    {objetivos.map((o) => (
                      <button
                        key={o.id}
                        disabled={pendiente}
                        onClick={() => usar(o.id)}
                        className="rounded-2xl border border-white/15 bg-white/[0.06] p-2.5 text-left text-xs text-white transition hover:border-white/50 disabled:opacity-50"
                      >
                        {sel.efecto === 'robar_carta' ? 'Robar: ' : 'Bloquear: '}
                        {o.texto}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="w-full rounded-full border border-white/25 bg-white/10 py-2 font-heading text-sm font-semibold text-white transition active:scale-95"
                  onClick={() => setSel(null)}
                >
                  Volver
                </button>
                {error && <p className="text-center text-xs text-rosa-acento">{error}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
