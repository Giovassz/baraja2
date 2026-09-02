// UI del catálogo de plot twists para /admin/plot-twists — mismo patrón que
// PanelCatalogoCartas: agregar en bloque (una línea "Nombre: Descripción" por plot
// twist), editar y quitar (desactivar) los existentes. Paleta neutra del panel admin.
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { BotonEnviar, Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/iconos';
import {
  agregarPlotTwists,
  desactivarPlotTwist,
  editarPlotTwist,
} from '@/lib/actions/admin';
import type { EfectoPlotTwist, Modalidad, TipoCarta } from '@/lib/supabase/tipos';

export interface FilaPlotTwist {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoCarta;
  modalidad: Modalidad;
  efecto: EfectoPlotTwist;
}

const TIPOS: { valor: TipoCarta; etiqueta: string }[] = [
  { valor: 'estandar', etiqueta: 'Estándar' },
  { valor: 'spicy', etiqueta: 'Spicy' },
];

const MODALIDADES: { valor: Modalidad; etiqueta: string }[] = [
  { valor: 'distancia', etiqueta: 'A distancia' },
  { valor: 'hibrida', etiqueta: 'Híbrida' },
  { valor: 'fisica', etiqueta: 'Presencial' },
];

const EFECTOS: { valor: EfectoPlotTwist; etiqueta: string }[] = [
  { valor: 'bloquear_carta', etiqueta: 'Bloquear carta' },
  { valor: 'robar_carta', etiqueta: 'Robar carta' },
  { valor: 'otro', etiqueta: 'Otro' },
];

const CAMPO =
  'rounded-lg border border-[var(--adm-border)] bg-[var(--adm-bg)] px-3 py-2 text-sm text-[var(--adm-text)] outline-none focus:border-[var(--adm-accent)]';

function etiquetaModalidad(m: Modalidad): string {
  return MODALIDADES.find((x) => x.valor === m)?.etiqueta ?? m;
}
function etiquetaEfecto(e: EfectoPlotTwist): string {
  return EFECTOS.find((x) => x.valor === e)?.etiqueta ?? e;
}

export function PanelPlotTwists({ filas }: { filas: FilaPlotTwist[] }) {
  const [filtroModalidad, setFiltroModalidad] = useState<'' | Modalidad>('');

  const filasFiltradas = useMemo(
    () => filas.filter((f) => filtroModalidad === '' || f.modalidad === filtroModalidad),
    [filas, filtroModalidad],
  );

  return (
    <div className="flex flex-col gap-5">
      <FormularioAgregar />

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg text-[var(--adm-text)]">
          En el catálogo{' '}
          <span className="text-[var(--adm-text-mute)]">({filasFiltradas.length})</span>
        </h2>

        <select
          value={filtroModalidad}
          onChange={(e) => setFiltroModalidad(e.target.value as typeof filtroModalidad)}
          className={`${CAMPO} !py-2`}
        >
          <option value="">Todas las modalidades</option>
          {MODALIDADES.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>

        {filasFiltradas.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--adm-text-mute)]">
            No hay plot twists con ese filtro.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filasFiltradas.map((f) => (
              <FilaPlotTwistCatalogo key={f.id} fila={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FormularioAgregar() {
  const [estado, accion] = useFormState(agregarPlotTwists, null);

  return (
    <form
      action={accion}
      className="flex flex-col gap-3 rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-4"
    >
      <h2 className="flex items-center gap-2 font-heading text-lg text-[var(--adm-text)]">
        <Icono.chispa className="h-4 w-4 text-[var(--adm-accent)]" strokeWidth={2.5} />
        Agregar plot twists
      </h2>

      <div className="flex flex-wrap gap-2">
        <select name="tipo" defaultValue="estandar" className={`${CAMPO} !py-2`}>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
        <select name="modalidad" defaultValue="distancia" className={`${CAMPO} !py-2`}>
          {MODALIDADES.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>
        <select name="efecto" defaultValue="bloquear_carta" className={`${CAMPO} !py-2`}>
          {EFECTOS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="lineas"
        rows={5}
        placeholder={'Uno por línea, formato "Nombre: Descripción":\nCambio de planes: Bloquea una carta de tu pareja por esta semana.'}
        className={`${CAMPO} resize-y`}
      />

      {estado?.error && <p className="text-sm text-[var(--adm-bad)]">{estado.mensaje}</p>}
      {estado?.ok && <p className="text-sm text-[var(--adm-text-dim)]">{estado.mensaje}</p>}

      <BotonEnviar className="w-full">Agregar al catálogo</BotonEnviar>
    </form>
  );
}

function FilaPlotTwistCatalogo({ fila }: { fila: FilaPlotTwist }) {
  const [confirmando, setConfirmando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [estado, accion] = useFormState(desactivarPlotTwist, null);
  const [estadoEditar, accionEditar] = useFormState(editarPlotTwist, null);

  useEffect(() => {
    if (estadoEditar?.ok) setEditando(false);
  }, [estadoEditar]);

  if (editando) {
    return (
      <form
        action={accionEditar}
        className="flex flex-col gap-2 rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-3"
      >
        <input type="hidden" name="id" value={fila.id} />
        <input
          type="text"
          name="nombre"
          defaultValue={fila.nombre}
          className={`${CAMPO} !py-2`}
          placeholder="Nombre"
        />
        <textarea
          name="descripcion"
          defaultValue={fila.descripcion}
          rows={2}
          className={`${CAMPO} resize-y`}
          placeholder="Descripción"
        />
        <div className="flex flex-wrap gap-2">
          <select name="tipo" defaultValue={fila.tipo} className={`${CAMPO} !py-2`}>
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
          <select name="modalidad" defaultValue={fila.modalidad} className={`${CAMPO} !py-2`}>
            {MODALIDADES.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.etiqueta}
              </option>
            ))}
          </select>
          <select name="efecto" defaultValue={fila.efecto} className={`${CAMPO} !py-2`}>
            {EFECTOS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </div>
        {estadoEditar?.error && (
          <p className="text-xs text-[var(--adm-bad)]">{estadoEditar.mensaje}</p>
        )}
        <div className="flex justify-end gap-1.5">
          <Boton
            type="button"
            variante="secundario"
            className="!px-2.5 !py-1.5 text-xs"
            onClick={() => setEditando(false)}
          >
            Cancelar
          </Boton>
          <BotonEnviar className="!px-2.5 !py-1.5 text-xs">Guardar</BotonEnviar>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--adm-text)]">{fila.nombre}</p>
          <p className="mt-0.5 text-xs text-[var(--adm-text-dim)]">{fila.descripcion}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--adm-surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--adm-text-dim)]">
              {fila.tipo === 'spicy' ? 'Spicy' : 'Estándar'}
            </span>
            <span className="rounded-full bg-[var(--adm-surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--adm-text-dim)]">
              {etiquetaModalidad(fila.modalidad)}
            </span>
            <span className="rounded-full bg-[var(--adm-accent)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--adm-accent)]">
              {etiquetaEfecto(fila.efecto)}
            </span>
          </div>
          {estado?.error && <p className="mt-1 text-xs text-[var(--adm-bad)]">{estado.mensaje}</p>}
        </div>

        {confirmando ? (
          <form action={accion} className="flex shrink-0 gap-1.5">
            <input type="hidden" name="id" value={fila.id} />
            <Boton
              type="button"
              variante="secundario"
              className="!px-2.5 !py-1.5 text-xs"
              onClick={() => setConfirmando(false)}
            >
              Cancelar
            </Boton>
            <BotonEnviar className="!px-2.5 !py-1.5 text-xs">Confirmar</BotonEnviar>
          </form>
        ) : (
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => setEditando(true)}
              aria-label="Editar plot twist"
              className="rounded-full bg-[var(--adm-surface-2)] p-2 text-[var(--adm-text-dim)] transition hover:bg-[var(--adm-accent)]/15 hover:text-[var(--adm-accent)]"
            >
              <Icono.lapiz className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              aria-label="Quitar plot twist del catálogo"
              className="rounded-full bg-[var(--adm-surface-2)] p-2 text-[var(--adm-text-dim)] transition hover:bg-[var(--adm-bad)]/15 hover:text-[var(--adm-bad)]"
            >
              <Icono.papelera className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
