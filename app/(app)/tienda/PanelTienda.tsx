// Tienda estilo Clash Royale: rejilla de ítems con arte, tipo y badge de precio
// Función nueva pedida por el usuario.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CaraCarta } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { IconoPrecio } from '@/components/ui/IconoPrecio';
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
  // Ojo: NO usar useTransition con una función async — en React 18 "pendiente" se
  // resuelve casi al instante (no espera la respuesta real del servidor), dejando una
  // ventana donde se puede volver a comprar antes de tiempo.
  const [enviando, setEnviando] = useState(false);
  const [comprando, setComprando] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<OpcionTienda | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { celebrar, Corazones } = useCelebracion();

  function comprar(id: string) {
    if (enviando) return;
    setError(null);
    setComprando(id);
    setEnviando(true);
    comprarPlotTwist(id).then((r) => {
      setComprando(null);
      setEnviando(false);
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

      {/* flex-wrap centrado en vez de grid-cols-3 fijo: con 1 o 2 opciones (como
          cuenta de prueba con pocos plot twists cargados) se ven centradas, no
          pegadas a la izquierda con un hueco vacío al lado. */}
      <div className="flex flex-wrap justify-center gap-2.5">
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
              className={`item-tienda w-[30%] min-w-[104px] max-w-[130px] ${alcanza ? 'ring-1 ring-menta/30' : ''}`}
              style={{
                borderTopColor: pr.color,
                borderTopWidth: 2,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 26px -14px rgba(0,0,0,0.8), 0 -8px 20px -16px ${pr.color}`,
              }}
            >
              <span
                className="text-[9px] font-extrabold uppercase tracking-wider"
                style={{ color: pr.color }}
              >
                {NOMBRE_EFECTO[o.efecto] ?? 'Plot twist'}
              </span>
              <div className="w-full">
                <CaraCarta icono={pr.icono} acento="plot" texto={o.nombre} compacta />
              </div>
              <p className="px-0.5 text-center text-[9px] leading-tight text-white/50">
                {pr.hint}
              </p>
              <span
                className={`precio-badge ${!alcanza ? 'precio-badge--rojo' : ''} ${
                  modoTester ? 'animate-pulso-glow' : ''
                }`}
              >
                <IconoPrecio tamano={15} />
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
            onClick={() => !enviando && setDetalle(null)}
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
                  disabled={(!modoTester && puntos < precio) || enviando}
                  onClick={() => comprar(detalle.id)}
                >
                  {comprando === detalle.id ? (
                    'Comprando…'
                  ) : (
                    <>
                      <Icono.estrella className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
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
