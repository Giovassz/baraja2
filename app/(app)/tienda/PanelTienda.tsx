// Lista de plot twists comprables + acción de compra con animación
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CaraCarta } from '@/components/ui/CartaJuego';
import { Icono } from '@/components/ui/iconos';
import { useCelebracion } from '@/components/ui/Celebracion';
import { presentacionPlotTwist } from '@/lib/reglas/carta';
import { comprarPlotTwist } from '@/lib/actions/tienda';
import type { OpcionTienda } from '@/lib/datos';

export function PanelTienda({
  puntos,
  precio,
  opciones,
}: {
  puntos: number;
  precio: number;
  opciones: OpcionTienda[];
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [comprando, setComprando] = useState<string | null>(null);
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
      celebrar();
      router.refresh();
    });
  }

  if (opciones.length === 0) {
    return (
      <p className="text-sm text-morado-marca/60">
        Todavía no hay plot twists cargados para su modalidad.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Corazones />
      {error && (
        <p className="rounded-widget bg-rosa-pastel/60 px-3 py-2 text-sm text-vino-marca">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {opciones.map((o, i) => {
          const pr = presentacionPlotTwist(o.efecto);
          const alcanza = puntos >= precio;
          const esteComprando = comprando === o.id;
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col gap-2"
            >
              <CaraCarta icono={pr.icono} acento="plot" texto={o.nombre} />
              <p className="text-[11px] leading-tight text-morado-marca/70">{o.descripcion}</p>
              <button
                className="boton-primario w-full py-2 text-xs"
                disabled={!alcanza || pendiente}
                onClick={() => comprar(o.id)}
              >
                {esteComprando ? (
                  'Comprando…'
                ) : (
                  <>
                    <Icono.moneda className="h-3.5 w-3.5" strokeWidth={2.5} />
                    {alcanza ? `Comprar · ${precio}` : `Faltan ${precio - puntos}`}
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
