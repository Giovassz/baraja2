// Widget del botón de reload (sección 4.8): 1 por ciclo, con estado visual
// Implementa BJ2-034, BJ2-036, BJ2-037
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { recargarCartas } from '@/lib/actions/cartas';
import { Icono } from '@/components/ui/iconos';

export function WidgetReload({
  usado,
  diasParaReinicio,
  cartasDisponibles,
}: {
  usado: boolean;
  diasParaReinicio: number;
  cartasDisponibles: number;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [esError, setEsError] = useState(false);

  const bloqueado = usado || cartasDisponibles === 0;

  function recargar() {
    setMensaje(null);
    iniciar(async () => {
      const r = await recargarCartas();
      setEsError(!r.ok);
      setMensaje(r.mensaje ?? null);
      if (r.ok) router.refresh();
    });
  }

  return (
    <article className="widget widget-menta flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 p-2 text-rosa-acento">
            <Icono.recargar
              className={`h-4 w-4 ${pendiente ? 'animate-spin' : ''}`}
              strokeWidth={2.5}
            />
          </span>
          <h3 className="text-base">Reload</h3>
        </div>
        <p className="mt-2 text-sm text-white/70">
          Cambia todas tus cartas disponibles por otras nuevas. Una vez por semana.
        </p>
      </div>

      {mensaje && (
        <p className={`mt-2 text-xs ${esError ? 'text-rosa-acento' : 'text-white/70'}`}>
          {mensaje}
        </p>
      )}

      <motion.button
        whileTap={{ scale: 0.96 }}
        className="boton-primario mt-3 w-full py-2 text-sm"
        disabled={bloqueado || pendiente}
        onClick={recargar}
      >
        {!bloqueado && !pendiente && <Icono.barajar className="h-4 w-4" strokeWidth={2.5} />}
        {pendiente
          ? 'Recargando…'
          : usado
            ? `Disponible en ${diasParaReinicio} día(s)`
            : cartasDisponibles === 0
              ? 'Sin cartas para recargar'
              : `Recargar ${cartasDisponibles} carta(s)`}
      </motion.button>
    </article>
  );
}
