// Lista de cuentas: ver perfil completo, modo tester, activar/desactivar, cambiar
// nombre y eliminar cuenta. Paleta neutra del panel admin (.admin-shell).
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import {
  alternarModoTester,
  alternarCuentaActiva,
  editarNombreUsuario,
  eliminarUsuario,
} from '@/lib/actions/admin';
import { Boton, BotonEnviar } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/iconos';

const NOMBRE_MODALIDAD: Record<string, string> = {
  distancia: 'A distancia',
  hibrida: 'Híbrida',
  fisica: 'Presencial',
};

export interface FilaUsuario {
  id: string;
  nombre: string;
  email: string;
  modoTester: boolean;
  cuentaActiva: boolean;
  registradoEl: string;
  nombreEspacio: string | null;
  modalidad: string | null;
  nombreCompanero: string | null;
  cartasCumplidas: number;
  puntosActuales: number;
  plotTwists: { total: number; usados: number };
  nivel: number;
}

export function PanelUsuarios({
  filas,
  busquedaInicial = '',
}: {
  filas: FilaUsuario[];
  busquedaInicial?: string;
}) {
  const [busqueda, setBusqueda] = useState(busquedaInicial);

  const filasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter(
      (f) =>
        f.nombre.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.nombreEspacio?.toLowerCase().includes(q) ||
        f.nombreCompanero?.toLowerCase().includes(q),
    );
  }, [filas, busqueda]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative max-w-md">
        <Icono.buscar
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adm-text-mute)]"
          strokeWidth={2.5}
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo, espacio o pareja…"
          className="w-full rounded-full border border-[var(--adm-border)] bg-[var(--adm-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--adm-text)] outline-none placeholder:text-[var(--adm-text-mute)] focus:border-[var(--adm-accent)]"
        />
      </div>
      <p className="text-xs text-[var(--adm-text-mute)]">
        {filasFiltradas.length} de {filas.length} cuenta(s)
      </p>
      {filasFiltradas.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--adm-text-mute)]">
          Nadie coincide con esa búsqueda.
        </p>
      ) : (
        <div className="grid items-start gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
          {filasFiltradas.map((fila) => (
            <FilaUsuarioAdmin key={fila.id} fila={fila} />
          ))}
        </div>
      )}
    </div>
  );
}

function Interruptor({
  activo,
  enviando,
  etiqueta,
  onClick,
}: {
  activo: boolean;
  enviando: boolean;
  etiqueta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={enviando}
      onClick={onClick}
      className={`relative h-7 w-[52px] shrink-0 rounded-full border transition disabled:opacity-50 ${
        activo
          ? 'border-[var(--adm-accent)] bg-[var(--adm-accent)]/25'
          : 'border-[var(--adm-border)] bg-[var(--adm-surface-2)]'
      }`}
    >
      <span
        className={`absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-transform ${
          activo ? 'translate-x-[23px]' : 'translate-x-1'
        }`}
      >
        {activo && <Icono.check className="h-3 w-3 text-[var(--adm-accent-2)]" strokeWidth={3} />}
      </span>
    </button>
  );
}

function FilaUsuarioAdmin({ fila }: { fila: FilaUsuario }) {
  const [tester, setTester] = useState(fila.modoTester);
  const [enviandoTester, setEnviandoTester] = useState(false);
  const [errorTester, setErrorTester] = useState<string | null>(null);

  const [cuentaActiva, setCuentaActiva] = useState(fila.cuentaActiva);
  const [enviandoCuenta, setEnviandoCuenta] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState<string | null>(null);

  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const [estadoNombre, accionNombre] = useFormState(editarNombreUsuario, null);
  const [estadoEliminar, accionEliminar] = useFormState(eliminarUsuario, null);

  // Ojo: NO usar useTransition con una función async — en React 18 "pendiente" se
  // resuelve casi al instante (no espera la respuesta real del servidor).
  function alternarTester() {
    if (enviandoTester) return;
    const nuevo = !tester;
    setErrorTester(null);
    setTester(nuevo); // optimista
    setEnviandoTester(true);
    alternarModoTester(fila.id, nuevo).then((r) => {
      setEnviandoTester(false);
      if (!r.ok) {
        setTester(!nuevo); // revierte
        setErrorTester(r.mensaje ?? 'No se pudo guardar.');
      }
    });
  }

  function alternarCuenta() {
    if (enviandoCuenta) return;
    const nuevo = !cuentaActiva;
    setErrorCuenta(null);
    setCuentaActiva(nuevo); // optimista
    setEnviandoCuenta(true);
    alternarCuentaActiva(fila.id, nuevo).then((r) => {
      setEnviandoCuenta(false);
      if (!r.ok) {
        setCuentaActiva(!nuevo); // revierte
        setErrorCuenta(r.mensaje ?? 'No se pudo guardar.');
      }
    });
  }

  // Cerrar el modo edición cuando el guardado del nombre sale bien. Con un efecto,
  // no en el cuerpo del render: si no, la próxima vez que se abra "editar" se
  // volvería a cerrar solo (el estado de useFormState no se resetea a null solo).
  useEffect(() => {
    if (estadoNombre?.ok) setEditando(false);
  }, [estadoNombre]);

  const fechaRegistro = new Date(fila.registradoEl).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className={`rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-4 ${cuentaActiva ? '' : 'opacity-60'}`}
    >
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
                className="rounded-lg border border-[var(--adm-border)] bg-[var(--adm-bg)] px-2.5 py-1.5 text-sm text-[var(--adm-text)] outline-none focus:border-[var(--adm-accent)]"
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
              <p className="truncate font-heading text-base text-[var(--adm-text)]">
                {fila.nombre}
              </p>
              <button
                type="button"
                onClick={() => setEditando(true)}
                aria-label={`Cambiar nombre de ${fila.nombre}`}
                className="shrink-0 rounded-full p-1 text-[var(--adm-text-mute)] transition hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]"
              >
                <Icono.lapiz className="h-3 w-3" strokeWidth={2.5} />
              </button>
              {!cuentaActiva && (
                <span className="rounded-full bg-[var(--adm-bad)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--adm-bad)]">
                  Desactivada
                </span>
              )}
              {tester && (
                <span className="rounded-full bg-[var(--adm-accent)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--adm-accent)]">
                  Tester
                </span>
              )}
            </div>
          )}
          <p className="truncate text-xs text-[var(--adm-text-mute)]">{fila.email}</p>
          {fila.nombreEspacio && (
            <p className="mt-0.5 truncate text-[11px] text-[var(--adm-text-mute)]">
              Espacio: {fila.nombreEspacio}
              {fila.nombreCompanero ? ` · con ${fila.nombreCompanero}` : ''}
            </p>
          )}
          {errorTester && <p className="mt-1 text-xs text-[var(--adm-bad)]">{errorTester}</p>}
          {errorCuenta && <p className="mt-1 text-xs text-[var(--adm-bad)]">{errorCuenta}</p>}
          {estadoNombre?.error && (
            <p className="mt-1 text-xs text-[var(--adm-bad)]">{estadoNombre.mensaje}</p>
          )}
          {estadoEliminar?.error && (
            <p className="mt-1 text-xs text-[var(--adm-bad)]">{estadoEliminar.mensaje}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPerfilAbierto((v) => !v)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--adm-border)] px-3 py-1.5 text-xs font-semibold text-[var(--adm-text-dim)] transition hover:border-[var(--adm-accent)] hover:text-[var(--adm-accent)]"
        >
          <Icono.ojo className="h-3.5 w-3.5" strokeWidth={2.5} />
          {perfilAbierto ? 'Ocultar' : 'Ver perfil'}
        </button>
      </div>

      {perfilAbierto && (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[var(--adm-surface-2)] p-3">
          <DatoPerfil etiqueta="Registrado" valor={fechaRegistro} />
          <DatoPerfil
            etiqueta="Modalidad"
            valor={fila.modalidad ? (NOMBRE_MODALIDAD[fila.modalidad] ?? fila.modalidad) : '—'}
          />
          <DatoPerfil etiqueta="Nivel de pareja" valor={`Nivel ${fila.nivel}`} />
          <DatoPerfil etiqueta="Puntos acumulados" valor={String(fila.puntosActuales)} />
          <DatoPerfil etiqueta="Cartas cumplidas" valor={String(fila.cartasCumplidas)} />
          <DatoPerfil
            etiqueta="Plot twists"
            valor={`${fila.plotTwists.usados} usados / ${fila.plotTwists.total} desbloq.`}
          />
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1.5 border-t border-[var(--adm-border)] pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--adm-text-dim)]">Cuenta activa</span>
          <Interruptor
            activo={cuentaActiva}
            enviando={enviandoCuenta}
            etiqueta={`Cuenta activa de ${fila.nombre}`}
            onClick={alternarCuenta}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--adm-text-dim)]">Modo tester</span>
          <Interruptor
            activo={tester}
            enviando={enviandoTester}
            etiqueta={`Modo tester de ${fila.nombre}`}
            onClick={alternarTester}
          />
        </div>
      </div>

      <div className="mt-2.5 flex justify-end border-t border-[var(--adm-border)] pt-2.5">
        {confirmandoEliminar ? (
          <form action={accionEliminar} className="flex items-center gap-2">
            <span className="text-xs text-[var(--adm-text-dim)]">¿Eliminar esta cuenta?</span>
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
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-[var(--adm-text-mute)] transition hover:bg-[var(--adm-bad)]/15 hover:text-[var(--adm-bad)]"
          >
            <Icono.papelera className="h-3.5 w-3.5" strokeWidth={2.5} />
            Eliminar cuenta
          </button>
        )}
      </div>
    </div>
  );
}

function DatoPerfil({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--adm-text-mute)]">
        {etiqueta}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[var(--adm-text)]">{valor}</p>
    </div>
  );
}
