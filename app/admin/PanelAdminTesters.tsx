// Lista de cuentas con un switch de "modo tester" cada una
'use client';

import { useState, useTransition } from 'react';
import { alternarModoTester } from '@/lib/actions/admin';
import { Icono } from '@/components/ui/iconos';

export interface FilaTester {
  id: string;
  nombre: string;
  email: string;
  modoTester: boolean;
  nombreEspacio: string | null;
}

export function PanelAdminTesters({ filas }: { filas: FilaTester[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {filas.map((fila) => (
        <FilaAdmin key={fila.id} fila={fila} />
      ))}
    </div>
  );
}

function FilaAdmin({ fila }: { fila: FilaTester }) {
  const [activo, setActivo] = useState(fila.modoTester);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function alternar() {
    const nuevo = !activo;
    setError(null);
    setActivo(nuevo); // optimista
    iniciar(async () => {
      const r = await alternarModoTester(fila.id, nuevo);
      if (!r.ok) {
        setActivo(!nuevo); // revierte
        setError(r.mensaje ?? 'No se pudo guardar.');
      }
    });
  }

  return (
    <div className="widget flex items-center justify-between gap-3 !p-4">
      <div className="min-w-0">
        <p className="truncate font-heading text-base">{fila.nombre}</p>
        <p className="truncate text-xs text-white/50">{fila.email}</p>
        {fila.nombreEspacio && (
          <p className="mt-0.5 truncate text-[11px] text-white/40">
            Espacio: {fila.nombreEspacio}
          </p>
        )}
        {error && <p className="mt-1 text-xs text-rosa-acento">{error}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={`Modo tester para ${fila.nombre}`}
        disabled={pendiente}
        onClick={alternar}
        className={`relative h-8 w-14 shrink-0 rounded-full border transition disabled:opacity-50 ${
          activo ? 'border-rosa-acento bg-rosa-acento/30' : 'border-white/20 bg-white/10'
        }`}
      >
        <span
          className={`absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform ${
            activo ? 'translate-x-[26px]' : 'translate-x-1'
          }`}
        >
          {activo && <Icono.check className="h-3.5 w-3.5 text-rosa-acento" strokeWidth={3} />}
        </span>
      </button>
    </div>
  );
}
