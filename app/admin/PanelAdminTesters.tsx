// Lista de cuentas con un switch de "modo tester" cada una
'use client';

import { useMemo, useState } from 'react';
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
  const [busqueda, setBusqueda] = useState('');

  const filasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter(
      (f) =>
        f.nombre.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.nombreEspacio?.toLowerCase().includes(q),
    );
  }, [filas, busqueda]);

  return (
    <div className="flex flex-col gap-2.5">
      {filas.length > 5 && (
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo o espacio…"
          className="campo-texto !py-2 text-sm"
        />
      )}
      {filasFiltradas.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/50">Nadie coincide con esa búsqueda.</p>
      ) : (
        filasFiltradas.map((fila) => <FilaAdmin key={fila.id} fila={fila} />)
      )}
    </div>
  );
}

function FilaAdmin({ fila }: { fila: FilaTester }) {
  const [activo, setActivo] = useState(fila.modoTester);
  // Ojo: NO usar useTransition con una función async — en React 18 "pendiente" se
  // resuelve casi al instante (no espera a que alternarModoTester() responda),
  // dejando una ventana donde se puede volver a tocar antes de tiempo.
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function alternar() {
    if (enviando) return;
    const nuevo = !activo;
    setError(null);
    setActivo(nuevo); // optimista
    setEnviando(true);
    alternarModoTester(fila.id, nuevo).then((r) => {
      setEnviando(false);
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
        disabled={enviando}
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
