// Lista de cuentas: modo tester, cambiar nombre y eliminar cuenta.
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { alternarModoTester, editarNombreUsuario, eliminarUsuario } from '@/lib/actions/admin';
import { Boton, BotonEnviar } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/iconos';

export interface FilaUsuario {
  id: string;
  nombre: string;
  email: string;
  modoTester: boolean;
  nombreEspacio: string | null;
}

export function PanelUsuarios({ filas }: { filas: FilaUsuario[] }) {
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
        filasFiltradas.map((fila) => <FilaUsuarioAdmin key={fila.id} fila={fila} />)
      )}
    </div>
  );
}

function FilaUsuarioAdmin({ fila }: { fila: FilaUsuario }) {
  const [activo, setActivo] = useState(fila.modoTester);
  // Ojo: NO usar useTransition con una función async — en React 18 "pendiente" se
  // resuelve casi al instante (no espera a que alternarModoTester() responda).
  const [enviandoTester, setEnviandoTester] = useState(false);
  const [errorTester, setErrorTester] = useState<string | null>(null);

  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  const [estadoNombre, accionNombre] = useFormState(editarNombreUsuario, null);
  const [estadoEliminar, accionEliminar] = useFormState(eliminarUsuario, null);

  function alternar() {
    if (enviandoTester) return;
    const nuevo = !activo;
    setErrorTester(null);
    setActivo(nuevo); // optimista
    setEnviandoTester(true);
    alternarModoTester(fila.id, nuevo).then((r) => {
      setEnviandoTester(false);
      if (!r.ok) {
        setActivo(!nuevo); // revierte
        setErrorTester(r.mensaje ?? 'No se pudo guardar.');
      }
    });
  }

  // Cerrar el modo edición cuando el guardado del nombre sale bien. Con un efecto,
  // no en el cuerpo del render: si no, la próxima vez que se abra "editar" se
  // volvería a cerrar solo (el estado de useFormState no se resetea a null solo).
  useEffect(() => {
    if (estadoNombre?.ok) setEditando(false);
  }, [estadoNombre]);

  return (
    <div className="widget flex flex-col gap-2 !p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editando ? (
            <form action={accionNombre} className="flex items-center gap-1.5">
              <input type="hidden" name="id" value={fila.id} />
              <input
                type="text"
                name="nombre"
                defaultValue={fila.nombre}
                maxLength={40}
                autoFocus
                className="campo-texto !py-1.5 text-sm"
              />
              <BotonEnviar className="!px-2.5 !py-1.5 text-xs">
                <Icono.check className="h-3.5 w-3.5" strokeWidth={3} />
              </BotonEnviar>
              <Boton
                type="button"
                variante="secundario"
                className="!px-2.5 !py-1.5 text-xs"
                onClick={() => setEditando(false)}
              >
                <Icono.cerrar className="h-3.5 w-3.5" strokeWidth={3} />
              </Boton>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="truncate font-heading text-base">{fila.nombre}</p>
              <button
                type="button"
                onClick={() => setEditando(true)}
                aria-label={`Cambiar nombre de ${fila.nombre}`}
                className="shrink-0 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <Icono.lapiz className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </div>
          )}
          <p className="truncate text-xs text-white/50">{fila.email}</p>
          {fila.nombreEspacio && (
            <p className="mt-0.5 truncate text-[11px] text-white/40">
              Espacio: {fila.nombreEspacio}
            </p>
          )}
          {errorTester && <p className="mt-1 text-xs text-rosa-acento">{errorTester}</p>}
          {estadoNombre?.error && (
            <p className="mt-1 text-xs text-rosa-acento">{estadoNombre.mensaje}</p>
          )}
          {estadoEliminar?.error && (
            <p className="mt-1 text-xs text-rosa-acento">{estadoEliminar.mensaje}</p>
          )}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={activo}
          aria-label={`Modo tester para ${fila.nombre}`}
          disabled={enviandoTester}
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

      <div className="flex justify-end border-t border-white/10 pt-2">
        {confirmandoEliminar ? (
          <form action={accionEliminar} className="flex items-center gap-2">
            <span className="text-xs text-white/60">¿Eliminar esta cuenta?</span>
            <input type="hidden" name="id" value={fila.id} />
            <Boton
              type="button"
              variante="secundario"
              className="!px-2.5 !py-1.5 text-xs"
              onClick={() => setConfirmandoEliminar(false)}
            >
              Cancelar
            </Boton>
            <BotonEnviar className="!px-2.5 !py-1.5 text-xs">Confirmar</BotonEnviar>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoEliminar(true)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-white/50 transition hover:bg-rosa-acento/15 hover:text-rosa-acento"
          >
            <Icono.papelera className="h-3.5 w-3.5" strokeWidth={2.5} />
            Eliminar cuenta
          </button>
        )}
      </div>
    </div>
  );
}
