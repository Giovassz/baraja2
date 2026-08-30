// Mesa de batalla (estilo TCG + Tinder): los retos que te jugaron son cartas-héroe con
// acción directa; tu mano y tus plot twists son cartas que se abren al tocarlas.
// Implementa BJ2-017, BJ2-018, BJ2-020, BJ2-025, BJ2-027, BJ2-028
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CartaJuego, CaraCarta } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { presentacionCarta, presentacionPlotTwist } from '@/lib/reglas/carta';
import { jugarCarta, confirmarCumplida } from '@/lib/actions/cartas';
import { usarPlotTwistBloquear, usarPlotTwistRobar } from '@/lib/actions/plot-twists';
import type { EstadoCarta } from '@/lib/supabase/tipos';

export interface CartaMesa {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  puntosOtorgados: number;
  estado: EstadoCarta;
}
export interface PlotTwistMesa {
  id: string;
  nombre: string;
  descripcion: string;
  efecto: 'bloquear_carta' | 'robar_carta' | 'otro';
}
export interface Objetivo {
  id: string;
  texto: string;
}

type Resultado = { ok: boolean; error?: string; mensaje?: string };
type Seleccion =
  | { clase: 'mano'; carta: CartaMesa }
  | { clase: 'plot'; plot: PlotTwistMesa };

export function MesaBatalla({
  mano,
  recibidas,
  plotTwists,
  objetivos,
  nombreCompanero,
}: {
  mano: CartaMesa[];
  recibidas: CartaMesa[];
  plotTwists: PlotTwistMesa[];
  objetivos: Objetivo[];
  nombreCompanero?: string;
}) {
  const router = useRouter();
  const [sel, setSel] = useState<Seleccion | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saliendo, setSaliendo] = useState(false);
  const { celebrar, Corazones } = useCelebracion();

  function correr(fn: () => Promise<Resultado>, celebra: boolean, onDone: () => void) {
    setError(null);
    iniciar(async () => {
      const r = await fn();
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo completar la acción.');
        return;
      }
      if (celebra) celebrar();
      onDone();
    });
  }

  function cerrarConAnim() {
    setSaliendo(true);
    setTimeout(() => {
      setSel(null);
      setSaliendo(false);
      router.refresh();
    }, 600);
  }

  return (
    <div className="flex flex-col gap-3">
      <Corazones />

      {/* Lane rival: retos recibidos (cartas-héroe) */}
      {recibidas.length > 0 && (
        <section className="lane lane-rival">
          <span className="lane-titulo">
            <Icono.sobre className="h-3 w-3" strokeWidth={2.5} />
            Retos de {nombreCompanero ?? 'tu pareja'}
          </span>
          <div className="flex flex-col gap-2.5">
            <AnimatePresence>
              {recibidas.map((c, i) => (
                <RetoRecibido
                  key={c.id}
                  carta={c}
                  indice={i}
                  pendiente={pendiente}
                  onCumplir={(despuesDeAnim) =>
                    correr(() => confirmarCumplida(c.id), true, despuesDeAnim)
                  }
                />
              ))}
            </AnimatePresence>
          </div>
          {error && <p className="mt-2 text-center text-xs text-vino-marca">{error}</p>}
        </section>
      )}

      {/* Divisor de batalla (solo si hay retos del rival arriba) */}
      {recibidas.length > 0 && (
        <div className="flex items-center gap-3 px-2 py-0.5">
          <span className="h-px flex-1 bg-morado-marca/15" />
          <span className="flex items-center gap-1 rounded-full bg-picante px-3 py-0.5 font-heading text-[11px] font-bold uppercase tracking-widest text-white">
            <Icono.espadas className="h-3 w-3" strokeWidth={2.5} />
            Tu lado
          </span>
          <span className="h-px flex-1 bg-morado-marca/15" />
        </div>
      )}

      {/* Lane propia: tu mano */}
      <section className="lane">
        <span className="lane-titulo">
          <Icono.mano className="h-3 w-3" strokeWidth={2.5} />
          Tu mano
        </span>
        {mano.length === 0 ? (
          <p className="py-4 text-center text-xs text-morado-marca/60">
            Sin cartas esta semana. Vuelve pronto.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {mano.map((c, i) => (
              <CartaTocable key={c.id} indice={i} onClick={() => setSel({ clase: 'mano', carta: c })}>
                <CartaJuego
                  id={c.id}
                  texto={c.texto}
                  tipo={c.tipo}
                  puntosOtorgados={c.puntosOtorgados}
                  estado={c.estado}
                  compacta
                />
              </CartaTocable>
            ))}
          </div>
        )}
      </section>

      {/* Lane plot twists */}
      {plotTwists.length > 0 && (
        <section className="lane lane-plot">
          <span className="lane-titulo">
            <Icono.chispa className="h-3 w-3" strokeWidth={2.5} />
            Tus plot twists
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {plotTwists.map((pt, i) => {
              const pr = presentacionPlotTwist(pt.efecto);
              return (
                <CartaTocable key={pt.id} indice={i} onClick={() => setSel({ clase: 'plot', plot: pt })}>
                  <CaraCarta icono={pr.icono} acento="plot" texto={pt.nombre} compacta />
                </CartaTocable>
              );
            })}
          </div>
        </section>
      )}

      {/* Overlay de carta seleccionada (mano o plot twist) */}
      <AnimatePresence>
        {sel && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-morado-marca/60 p-6 backdrop-blur-sm"
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
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {sel.clase === 'plot' ? (
                <CaraCarta
                  icono={presentacionPlotTwist(sel.plot.efecto).icono}
                  acento="plot"
                  texto={sel.plot.nombre}
                />
              ) : (
                <CartaJuego
                  id={sel.carta.id}
                  texto={sel.carta.texto}
                  tipo={sel.carta.tipo}
                  puntosOtorgados={sel.carta.puntosOtorgados}
                  estado={sel.carta.estado}
                />
              )}

              <div className="mt-3 flex flex-col gap-2">
                {sel.clase === 'mano' &&
                  (sel.carta.estado === 'disponible' ? (
                    <button
                      className="boton-primario w-full py-2.5 text-sm"
                      disabled={pendiente}
                      onClick={() =>
                        correr(() => jugarCarta(sel.carta.id), false, cerrarConAnim)
                      }
                    >
                      <Icono.jugar className="h-4 w-4" strokeWidth={2.5} />
                      {pendiente
                        ? 'Jugando…'
                        : nombreCompanero
                          ? `Jugar con ${nombreCompanero}`
                          : 'Jugar carta'}
                    </button>
                  ) : (
                    <p className="text-center text-xs text-white/90">
                      {sel.carta.estado === 'jugada'
                        ? 'Ya está en juego. Esperando a que la cumplan.'
                        : 'Esta carta ya no está disponible.'}
                    </p>
                  ))}

                {sel.clase === 'plot' && (
                  <>
                    <p className="text-center text-xs text-white/90">{sel.plot.descripcion}</p>
                    {objetivos.length === 0 ? (
                      <p className="text-center text-xs text-white/70">
                        Tu pareja no tiene cartas disponibles para este plot twist.
                      </p>
                    ) : (
                      <div className="flex max-h-44 flex-col gap-2 overflow-y-auto">
                        {objetivos.map((o) => (
                          <button
                            key={o.id}
                            disabled={pendiente}
                            onClick={() =>
                              correr(
                                () =>
                                  sel.plot.efecto === 'robar_carta'
                                    ? usarPlotTwistRobar(sel.plot.id, o.id)
                                    : usarPlotTwistBloquear(sel.plot.id, o.id),
                                true,
                                cerrarConAnim,
                              )
                            }
                            className="rounded-widget border-2 border-white/25 bg-white/10 p-2.5 text-left text-xs text-white transition hover:border-white/60 disabled:opacity-50"
                          >
                            {sel.plot.efecto === 'robar_carta' ? 'Robar: ' : 'Bloquear: '}
                            {o.texto}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <button
                  className="w-full rounded-full border-2 border-white/35 bg-white/10 py-2 font-heading text-sm font-semibold text-white transition active:scale-95"
                  disabled={pendiente}
                  onClick={() => setSel(null)}
                >
                  Volver
                </button>
                {error && <p className="text-center text-xs text-white">{error}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RetoRecibido({
  carta,
  indice,
  pendiente,
  onCumplir,
}: {
  carta: CartaMesa;
  indice: number;
  pendiente: boolean;
  onCumplir: (despuesDeAnim: () => void) => void;
}) {
  const [saliendo, setSaliendo] = useState(false);
  const router = useRouter();
  const pr = presentacionCarta(carta.id, carta.tipo, carta.puntosOtorgados);
  const Ico = Icono[pr.icono];

  function cumplir() {
    onCumplir(() => {
      setSaliendo(true);
      setTimeout(() => router.refresh(), 480);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={
        saliendo
          ? { x: 340, opacity: 0, rotate: 12 }
          : { opacity: 1, y: 0, scale: 1, x: 0, rotate: 0 }
      }
      exit={{ x: 340, opacity: 0, rotate: 12 }}
      transition={{ delay: saliendo ? 0 : indice * 0.06, type: 'spring', stiffness: 240, damping: 22 }}
      className="hero-reto"
    >
      <div className="flex items-center gap-3 rounded-[18px] bg-white p-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_8px_18px_-6px_rgba(232,93,138,0.6)] ${
            carta.tipo === 'spicy'
              ? 'bg-gradient-to-br from-vino-marca to-morado-marca'
              : 'bg-rosa-acento'
          }`}
        >
          <Ico className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-vino-marca">
            {carta.tipo === 'spicy' ? 'Reto Spicy' : 'Reto'}
          </p>
          <p className="line-clamp-2 font-heading text-[13px] font-semibold leading-tight text-morado-marca">
            {carta.texto}
          </p>
        </div>
        <button
          className="shrink-0 rounded-full bg-gradient-to-r from-rosa-acento to-vino-marca px-4 py-2 font-heading text-xs font-bold text-white shadow-[0_8px_18px_-6px_rgba(232,93,138,0.7)] transition active:scale-95 disabled:opacity-50"
          disabled={pendiente || saliendo}
          onClick={cumplir}
        >
          {pendiente ? '…' : 'Cumplir'}
        </button>
      </div>
    </motion.div>
  );
}

function CartaTocable({
  children,
  onClick,
  indice = 0,
}: {
  children: React.ReactNode;
  onClick: () => void;
  indice?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 22, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: indice * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className="rounded-naipe outline-none focus-visible:ring-4 focus-visible:ring-rosa-acento/40"
    >
      {children}
    </motion.button>
  );
}
