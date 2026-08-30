// Abanico de cartas: la mano semanal se muestra como una baraja de póker en arco.
// Cada naipe muestra solo su valor y palo; al tocarlo sale al centro con el reto
// completo y sus acciones (rediseño solicitado).
// Implementa BJ2-017, BJ2-018
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Naipe } from '@/components/ui/Naipe';
import { Icono, type LucideIcon } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { caraDeNaipe, type Palo } from '@/lib/reglas/naipe';
import { jugarCarta } from '@/lib/actions/cartas';
import type { EstadoCarta } from '@/lib/supabase/tipos';

export interface CartaMano {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  estado: EstadoCarta;
}

const ETIQUETA: Partial<Record<EstadoCarta, string>> = {
  jugada: 'En juego',
  cumplida: 'Cumplida',
  bloqueada: 'Bloqueada',
  robada: 'Robada',
};

const ICONO_PALO: Record<Palo, LucideIcon> = {
  corazon: Icono.corazon,
  rombo: Icono.rombo,
  trebol: Icono.trebol,
  pica: Icono.pica,
};

export function AbanicoCartas({
  cartas,
  nombreCompanero,
}: {
  cartas: CartaMano[];
  nombreCompanero?: string;
}) {
  const router = useRouter();
  const [activa, setActiva] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  const cartaActiva = cartas.find((c) => c.id === activa) ?? null;
  const n = cartas.length;
  const centro = (n - 1) / 2;

  function jugar(id: string) {
    setError(null);
    iniciar(async () => {
      const r = await jugarCarta(id);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo jugar la carta.');
        return;
      }
      celebrar();
      setActiva(null);
      router.refresh();
    });
  }

  if (n === 0) {
    return (
      <p className="text-sm text-morado-marca/60">
        Todavía no tienes cartas esta semana. Vuelve en un momento.
      </p>
    );
  }

  return (
    <>
      <Corazones />
      {/* Abanico */}
      <div className="relative mx-auto flex h-[230px] w-full max-w-md items-center justify-center">
        {cartas.map((carta, i) => {
          const offset = i - centro;
          const rot = offset * 6;
          const x = offset * 44;
          const y = Math.abs(offset) * 10;
          const cara = caraDeNaipe(carta.id, carta.tipo);
          const IconoPalo = ICONO_PALO[cara.palo];
          const usada = carta.estado !== 'disponible';
          const spicy = carta.tipo === 'spicy';

          return (
            <motion.button
              key={carta.id}
              type="button"
              onClick={() => setActiva(carta.id)}
              className="absolute w-[104px] origin-bottom rounded-naipe outline-none focus-visible:ring-4 focus-visible:ring-rosa-acento/40"
              style={{ zIndex: i }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, x, y, rotate: rot }}
              transition={{ type: 'spring', stiffness: 240, damping: 24, delay: i * 0.05 }}
              whileHover={{ y: y - 22, rotate: rot * 0.35, zIndex: 30, scale: 1.03 }}
              aria-label={`Carta ${cara.valor} de ${cara.palo}: ${carta.texto}`}
            >
              <Naipe
                cara={cara}
                spicy={spicy}
                atenuado={carta.estado === 'bloqueada' || carta.estado === 'robada'}
              >
                <div className="flex flex-1 flex-col items-center justify-center gap-1">
                  <span
                    className={`font-naipe text-3xl font-bold ${
                      spicy || cara.rojo ? 'text-rosa-acento' : 'text-morado-marca'
                    }`}
                  >
                    {cara.valor}
                  </span>
                  <IconoPalo
                    className={`h-6 w-6 ${
                      spicy || cara.rojo ? 'text-rosa-acento' : 'text-morado-marca'
                    }`}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>
              </Naipe>

              {usada && (
                <span
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-morado-marca p-1 text-white shadow-widget-sm"
                  title={ETIQUETA[carta.estado]}
                >
                  {carta.estado === 'cumplida' ? (
                    <Icono.check className="h-3 w-3" strokeWidth={3} />
                  ) : carta.estado === 'jugada' ? (
                    <Icono.reloj className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    <Icono.candado className="h-3 w-3" strokeWidth={3} />
                  )}
                </span>
              )}
              {spicy && !usada && (
                <span className="absolute -left-1.5 -top-1.5 rounded-full bg-rosa-acento p-1 text-white shadow-widget-sm">
                  <Icono.llama className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Carta activa al centro */}
      <AnimatePresence>
        {cartaActiva && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-morado-marca/45 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiva(null)}
          >
            <motion.div
              className="w-full max-w-[280px]"
              initial={{ scale: 0.8, y: 40, rotate: -4 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Naipe
                cara={caraDeNaipe(cartaActiva.id, cartaActiva.tipo)}
                spicy={cartaActiva.tipo === 'spicy'}
              >
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                  {cartaActiva.tipo === 'spicy' && (
                    <span className="chip bg-rosa-acento/15 text-rosa-acento">
                      <Icono.llama className="h-3 w-3" strokeWidth={2.5} /> Spicy
                    </span>
                  )}
                  {ETIQUETA[cartaActiva.estado] && (
                    <span className="chip">{ETIQUETA[cartaActiva.estado]}</span>
                  )}
                  <p className="font-body text-sm font-semibold leading-snug text-morado-marca text-balance">
                    {cartaActiva.texto}
                  </p>
                </div>
              </Naipe>

              <div className="mt-3 flex flex-col gap-2">
                {cartaActiva.estado === 'disponible' ? (
                  <button
                    className="boton-primario w-full py-2.5 text-sm"
                    disabled={pendiente}
                    onClick={() => jugar(cartaActiva.id)}
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
                    {cartaActiva.estado === 'jugada'
                      ? 'Ya está en juego. Esperando a que la cumplan.'
                      : `Esta carta está ${ETIQUETA[cartaActiva.estado]?.toLowerCase()}.`}
                  </p>
                )}
                <button
                  className="w-full rounded-full border-2 border-white/40 bg-white/10 py-2 font-heading text-sm font-semibold text-white transition active:scale-95"
                  onClick={() => setActiva(null)}
                >
                  Volver a la mano
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
