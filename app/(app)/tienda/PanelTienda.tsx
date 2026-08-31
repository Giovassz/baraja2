// Tienda estilo Clash Royale: rejilla de ítems con arte, tipo y badge de precio
// Función nueva pedida por el usuario.
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CaraCarta } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { presentacionPlotTwist } from '@/lib/reglas/carta';
import { comprarPlotTwist } from '@/lib/actions/tienda';
import type { OpcionTienda } from '@/lib/datos';

const NOMBRE_EFECTO: Record<string, string> = {
  bloquear_carta: 'Bloqueo',
  robar_carta: 'Robo',
  otro: 'Especial',
};

export function PanelTienda({
  puntos,
  precio,
  opciones,
  modoTester = false,
}: {
  puntos: number;
  precio: number;
  opciones: OpcionTienda[];
  /** Cuenta de prueba: comprar no gasta puntos ni exige tenerlos. */
  modoTester?: boolean;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [comprando, setComprando] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<OpcionTienda | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  function comprar(id: string) {
    setError(null);
    setComprando(id);
    iniciar(async () => {
      const r = await comprarPlotTwist(id);
      setComprando(null);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo comprar.');
        return;
      }
      setDetalle(null);
      celebrar();
      router.refresh();
    });
  }

  if (opciones.length === 0) {
    return (
      <p className="text-sm text-white/60">
        Todavía no hay plot twists cargados para su modalidad.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Corazones />
      {error && (
        <p className="rounded-2xl bg-rosa-acento/15 px-3 py-2 text-center text-sm font-semibold text-rosa-acento">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {opciones.map((o, i) => {
          const pr = presentacionPlotTwist(o.efecto);
          const alcanza = modoTester || puntos >= precio;
          return (
            <motion.button
              key={o.id}
              type="button"
              onClick={() => setDetalle(o)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className={`item-tienda ${alcanza ? 'ring-1 ring-menta/30' : ''}`}
            >
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#c9b4ec]">
                {NOMBRE_EFECTO[o.efecto] ?? 'Plot twist'}
              </span>
              <div className="w-full">
                <CaraCarta icono={pr.icono} acento="plot" texto={o.nombre} compacta />
              </div>
              <span className={`precio-badge ${!alcanza ? 'precio-badge--rojo' : ''}`}>
                <Icono.moneda className="h-3.5 w-3.5" strokeWidth={2.5} />
                {modoTester ? '∞' : precio}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Detalle / compra */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-noche/85 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pendiente && setDetalle(null)}
          >
            <motion.div
              className="w-full max-w-[260px]"
              initial={{ scale: 0.82, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CaraCarta
                icono={presentacionPlotTwist(detalle.efecto).icono}
                acento="plot"
                texto={detalle.nombre}
              />
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-center text-xs text-white/80">{detalle.descripcion}</p>
                <button
                  className="boton-primario w-full py-2.5 text-sm"
                  disabled={(!modoTester && puntos < precio) || pendiente}
                  onClick={() => comprar(detalle.id)}
                >
                  {comprando === detalle.id ? (
                    'Comprando…'
                  ) : (
                    <>
                      <Icono.moneda className="h-4 w-4" strokeWidth={2.5} />
                      {modoTester
                        ? 'Comprar · gratis (tester)'
                        : puntos >= precio
                          ? `Comprar · ${precio}`
                          : `Te faltan ${precio - puntos}`}
                    </>
                  )}
                </button>
                <button
                  className="w-full rounded-full border border-white/20 bg-white/10 py-2 font-heading text-sm font-semibold text-white transition active:scale-95"
                  onClick={() => setDetalle(null)}
                >
                  Volver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
