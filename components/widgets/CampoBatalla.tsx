// Campo de batalla: tus cartas que ya lanzaste y siguen en juego. En cuanto la
// juegas, sale de "Tu mano" (el mazo se hace más chico, como en un TCG de verdad) y
// aparece aquí, arriba, hasta que tu pareja la cumpla y tú la confirmes.
// Implementa BJ2-020
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CartaJuego } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { confirmarCumplida } from '@/lib/actions/cartas';

export interface CartaEnCampo {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  puntosOtorgados: number;
  /** Tu pareja ya avisó "ya lo hice" — falta que tú lo confirmes. */
  reclamada: boolean;
}

export function CampoBatalla({
  cartas,
  nombreCompanero,
}: {
  cartas: CartaEnCampo[];
  nombreCompanero?: string;
}) {
  const router = useRouter();
  const [activaId, setActivaId] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  const activa = cartas.find((c) => c.id === activaId) ?? null;

  function confirmar(carta: CartaEnCampo) {
    setError(null);
    iniciar(async () => {
      const r = await confirmarCumplida(carta.id);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo confirmar.');
        return;
      }
      setConfirmando(true);
      celebrar();
      setTimeout(() => {
        setActivaId(null);
        setConfirmando(false);
        router.refresh();
      }, 620);
    });
  }

  // Nada en juego todavía: no ocupamos espacio, aparece en cuanto lanzas algo.
  if (cartas.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
        <Icono.jugar className="h-3 w-3 text-rosa-acento" strokeWidth={2.5} />
        En juego
      </p>
      <Corazones />
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {cartas.map((carta) => (
          <button
            key={carta.id}
            type="button"
            onClick={() => setActivaId(carta.id)}
            className="w-[104px] shrink-0 rounded-naipe outline-none focus-visible:ring-4 focus-visible:ring-rosa-acento/40"
            aria-label={`Carta en juego: ${carta.texto}`}
          >
            <CartaJuego
              id={carta.id}
              texto={carta.texto}
              tipo={carta.tipo}
              puntosOtorgados={carta.puntosOtorgados}
              estado="jugada"
              reclamada={carta.reclamada}
              compacta
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activa && (
          <motion.div
            className="fixed inset-0 z-[65] flex flex-col items-center justify-center gap-4 bg-noche/90 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pendiente && setActivaId(null)}
          >
            <button
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setActivaId(null)}
              aria-label="Cerrar"
            >
              <Icono.cerrar className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <motion.div
              className="w-full max-w-[240px]"
              initial={{ scale: 0.8, y: 50, rotate: -6 }}
              animate={
                confirmando
                  ? { scale: 1.15, y: -170, rotate: 16, opacity: 0 }
                  : { scale: 1, y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CartaJuego
                id={activa.id}
                texto={activa.texto}
                tipo={activa.tipo}
                puntosOtorgados={activa.puntosOtorgados}
                estado="jugada"
                reclamada={activa.reclamada}
              />
            </motion.div>

            <div
              className="flex w-full max-w-[240px] flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {activa.reclamada ? (
                <>
                  <button
                    className="boton-primario w-full py-3 text-sm"
                    disabled={pendiente || confirmando}
                    onClick={() => confirmar(activa)}
                  >
                    <Icono.check className="h-4 w-4" strokeWidth={2.5} />
                    {pendiente ? 'Confirmando…' : '¿Ya la cumplió? Confirmar'}
                  </button>
                  <p className="text-center text-[11px] text-white/50">
                    {nombreCompanero ?? 'Tu pareja'} avisó que ya la cumplió — al
                    confirmar, gana el punto.
                  </p>
                </>
              ) : (
                <p className="text-center text-xs text-white/70">
                  En juego · esperando a que {nombreCompanero ?? 'tu pareja'} avise que
                  la cumplió
                </p>
              )}
              {error && <p className="text-center text-xs text-rosa-acento">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
