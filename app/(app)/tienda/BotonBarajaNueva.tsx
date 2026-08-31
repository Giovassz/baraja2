// Botón "Baraja nueva" — solo visible con modo tester activo. Reload normal
// solo cambia cartas disponibles; esto también reemplaza las ya cumplidas, para no
// quedar atorado esperando los 7 días mientras pruebas.
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { repartirBarajaTester } from '@/lib/actions/cartas';
import { Icono } from '@/components/ui/iconos';

export function BotonBarajaNueva() {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [esError, setEsError] = useState(false);

  function repartir() {
    setMensaje(null);
    iniciar(async () => {
      const r = await repartirBarajaTester();
      setEsError(!r.ok);
      setMensaje(r.mensaje ?? null);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <button
        type="button"
        className="boton-secundario w-full py-2 text-sm"
        disabled={pendiente}
        onClick={repartir}
      >
        <Icono.barajar className="h-4 w-4" strokeWidth={2.5} />
        {pendiente ? 'Repartiendo…' : 'Baraja nueva (sin esperar)'}
      </button>
      {mensaje && (
        <p className={`text-center text-xs ${esError ? 'text-rosa-acento' : 'text-menta'}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
