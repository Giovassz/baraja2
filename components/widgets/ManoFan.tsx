// La mano del jugador: cartas agarradas en abanico, como si las sostuvieras.
// 1 toque = ver preview de la carta. 2 toques (otra vez sobre la misma):
// - si está disponible, la lanza hacia tu pareja.
// - si ya está en juego Y tu pareja ya avisó "ya lo hice" (reclamada), la
//   confirma como cumplida — quien manda el reto es quien confirma, y el punto
//   se lo lleva quien lo cumplió (tu pareja), no quien lo mandó.
// - si está en juego pero tu pareja aún no avisa, solo se puede esperar.
// Implementa BJ2-017, BJ2-018, BJ2-020
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CartaJuego } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { jugarCarta, confirmarCumplida } from '@/lib/actions/cartas';
import type { EstadoCarta } from '@/lib/supabase/tipos';

export interface CartaMano {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  puntosOtorgados: number;
  estado: EstadoCarta;
  /** Tu pareja ya avisó "ya lo hice" — falta que tú lo confirmes. */
  reclamada: boolean;
}

const ETIQUETA: Partial<Record<EstadoCarta, string>> = {
  jugada: 'En juego',
  cumplida: 'Cumplida',
  bloqueada: 'Bloqueada',
  robada: 'Robada',
};

export function ManoFan({
  cartas,
  nombreCompanero,
}: {
  cartas: CartaMano[];
  nombreCompanero?: string;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [lanzando, setLanzando] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  const cartaPreview = cartas.find((c) => c.id === preview) ?? null;
  const n = cartas.length;
  const centro = (n - 1) / 2;

  function tocar(carta: CartaMano) {
    setError(null);
    if (preview !== carta.id) {
      setPreview(carta.id);
      return;
    }
    if (carta.estado === 'disponible') {
      iniciar(async () => {
        const r = await jugarCarta(carta.id);
        if (!r.ok) {
          setError(r.mensaje ?? 'No se pudo jugar la carta.');
          return;
        }
        setLanzando(true);
        celebrar();
        setTimeout(() => {
          setPreview(null);
          setLanzando(false);
          router.refresh();
        }, 620);
      });
      return;
    }
    if (carta.estado === 'jugada' && carta.reclamada) {
      iniciar(async () => {
        const r = await confirmarCumplida(carta.id);
        if (!r.ok) {
          setError(r.mensaje ?? 'No se pudo confirmar.');
          return;
        }
        setLanzando(true);
        celebrar();
        setTimeout(() => {
          setPreview(null);
          setLanzando(false);
          router.refresh();
        }, 620);
      });
      return;
    }
    if (carta.estado === 'jugada') {
      setError('Tu pareja todavía no avisa que lo cumplió.');
      return;
    }
    setError('Esta carta ya no se puede jugar.');
  }

  if (n === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/50">
        Sin cartas esta semana. Vuelve pronto.
      </p>
    );
  }

  return (
    <>
      <Corazones />

      <div className="relative mx-auto mb-1 flex h-[168px] w-full max-w-md items-end justify-center">
        {cartas.map((carta, i) => {
          const offset = i - centro;
          const activa = preview === carta.id;
          return (
            <motion.button
              key={carta.id}
              type="button"
              onClick={() => tocar(carta)}
              className="absolute bottom-0 w-[114px] origin-bottom rounded-naipe outline-none focus-visible:ring-4 focus-visible:ring-rosa-acento/40"
              style={{ zIndex: activa ? 50 : i }}
              initial={{ opacity: 0, y: 60 }}
              animate={{
                opacity: activa ? 0 : 1,
                x: offset * 54,
                y: -Math.abs(offset) * 6,
                rotate: offset * 4,
              }}
              transition={{ type: 'spring', stiffness: 240, damping: 24, delay: i * 0.04 }}
              whileHover={{ y: -Math.abs(offset) * 6 - 22, rotate: offset * 1.6, zIndex: 40 }}
              aria-label={`Carta: ${carta.texto}`}
            >
              <CartaJuego
                id={carta.id}
                texto={carta.texto}
                tipo={carta.tipo}
                puntosOtorgados={carta.puntosOtorgados}
                estado={carta.estado}
                reclamada={carta.reclamada}
                compacta
              />
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-white/40">
        Toca una carta para verla · tócala otra vez para lanzarla o confirmarla
      </p>

      <AnimatePresence>
        {cartaPreview && (
          <motion.div
            className="fixed inset-0 z-[65] flex flex-col items-center justify-center gap-4 bg-noche/90 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pendiente && setPreview(null)}
          >
            <button
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setPreview(null)}
              aria-label="Cerrar"
            >
              <Icono.cerrar className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <motion.div
              className="w-full max-w-[240px]"
              initial={{ scale: 0.8, y: 50, rotate: -6 }}
              animate={
                lanzando
                  ? { scale: 1.15, y: -170, rotate: 16, opacity: 0 }
                  : { scale: 1, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => {
                e.stopPropagation();
                tocar(cartaPreview);
              }}
            >
              <CartaJuego
                id={cartaPreview.id}
                texto={cartaPreview.texto}
                tipo={cartaPreview.tipo}
                puntosOtorgados={cartaPreview.puntosOtorgados}
                estado={cartaPreview.estado}
                reclamada={cartaPreview.reclamada}
              />
            </motion.div>

            <div
              className="flex w-full max-w-[240px] flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {cartaPreview.estado === 'disponible' ? (
                <button
                  className="boton-primario w-full py-3 text-sm"
                  disabled={pendiente || lanzando}
                  onClick={() => tocar(cartaPreview)}
                >
                  <Icono.jugar className="h-4 w-4" strokeWidth={2.5} />
                  {pendiente
                    ? 'Lanzando…'
                    : nombreCompanero
                      ? `Lanzar a ${nombreCompanero}`
                      : 'Lanzar carta'}
                </button>
              ) : cartaPreview.estado === 'jugada' && cartaPreview.reclamada ? (
                <>
                  <button
                    className="boton-primario w-full py-3 text-sm"
                    disabled={pendiente || lanzando}
                    onClick={() => tocar(cartaPreview)}
                  >
                    <Icono.check className="h-4 w-4" strokeWidth={2.5} />
                    {pendiente ? 'Confirmando…' : '¿Ya la cumplió? Confirmar'}
                  </button>
                  <p className="text-center text-[11px] text-white/50">
                    {nombreCompanero ?? 'Tu pareja'} avisó que ya la cumplió — al confirmar, gana el punto.
                  </p>
                </>
              ) : cartaPreview.estado === 'jugada' ? (
                <p className="text-center text-xs text-white/70">
                  En juego · esperando a que {nombreCompanero ?? 'tu pareja'} avise que la cumplió
                </p>
              ) : (
                <p className="text-center text-xs text-white/70">
                  {ETIQUETA[cartaPreview.estado]}
                </p>
              )}
              {error && <p className="text-center text-xs text-rosa-acento">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
