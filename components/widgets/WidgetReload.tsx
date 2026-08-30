// Widget del botón de reload (sección 4.8): 1 por ciclo, con estado visual
// Implementa BJ2-034, BJ2-036, BJ2-037
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { recargarCartas } from '@/lib/actions/cartas';

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
    <article className="widget flex flex-col justify-between bg-gradient-to-br from-menta to-blanco-calido">
      <div>
        <h3 className="text-lg">🔄 Reload</h3>
        <p className="mt-1 text-sm text-morado-marca/70">
          Cambia todas tus cartas disponibles por otras nuevas. Una vez por semana.
        </p>
      </div>

      {mensaje && (
        <p className={`mt-2 text-xs ${esError ? 'text-vino-marca' : 'text-morado-marca/70'}`}>
          {mensaje}
        </p>
      )}

      <button
        className="boton-primario mt-3 w-full py-2 text-sm"
        disabled={bloqueado || pendiente}
        onClick={recargar}
      >
        {pendiente
          ? 'Recargando…'
          : usado
            ? `Disponible en ${diasParaReinicio} día(s)`
            : cartasDisponibles === 0
              ? 'No tienes cartas para recargar'
              : `Recargar ${cartasDisponibles} carta(s)`}
      </button>
    </article>
  );
}
