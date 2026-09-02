// UI del catálogo de plot twists para /admin/plot-twists — mismo patrón que
// PanelCatalogoCartas: agregar en bloque (una línea "Nombre: Descripción" por plot
// twist), editar y quitar (desactivar) los existentes.
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
        <h2 className="text-lg">
          En el catálogo <span className="text-white/40">({filasFiltradas.length})</span>
        </h2>

        <select
          value={filtroModalidad}
          onChange={(e) => setFiltroModalidad(e.target.value as typeof filtroModalidad)}
          className="campo-texto !py-2 text-sm"
        >
          <option value="">Todas las modalidades</option>
          {MODALIDADES.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>

        {filasFiltradas.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/50">No hay plot twists con ese filtro.</p>
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
    <form action={accion} className="widget flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg">
        <Icono.chispa className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
        Agregar plot twists
      </h2>

      <div className="flex flex-wrap gap-2">
        <select name="tipo" defaultValue="estandar" className="campo-texto !py-2 text-sm">
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
        <select name="modalidad" defaultValue="distancia" className="campo-texto !py-2 text-sm">
          {MODALIDADES.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>
        <select name="efecto" defaultValue="bloquear_carta" className="campo-texto !py-2 text-sm">
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
        className="campo-texto resize-y text-sm"
      />

      {estado?.error && <p className="text-sm text-rosa-acento">{estado.mensaje}</p>}
      {estado?.ok && <p className="text-sm text-white/70">{estado.mensaje}</p>}

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
      <form action={accionEditar} className="widget flex flex-col gap-2 !p-3">
        <input type="hidden" name="id" value={fila.id} />
        <input
          type="text"
          name="nombre"
          defaultValue={fila.nombre}
          className="campo-texto !py-2 text-sm"
          placeholder="Nombre"
        />
        <textarea
          name="descripcion"
          defaultValue={fila.descripcion}
          rows={2}
          className="campo-texto resize-y text-sm"
          placeholder="Descripción"
        />
        <div className="flex flex-wrap gap-2">
          <select name="tipo" defaultValue={fila.tipo} className="campo-texto !py-2 text-sm">
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
          <select
            name="modalidad"
            defaultValue={fila.modalidad}
            className="campo-texto !py-2 text-sm"
          >
            {MODALIDADES.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.etiqueta}
              </option>
            ))}
          </select>
          <select name="efecto" defaultValue={fila.efecto} className="campo-texto !py-2 text-sm">
            {EFECTOS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </div>
        {estadoEditar?.error && (
          <p className="text-xs text-rosa-acento">{estadoEditar.mensaje}</p>
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
    <div className="widget !p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white/90">{fila.nombre}</p>
          <p className="mt-0.5 text-xs text-white/60">{fila.descripcion}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="chip">{fila.tipo === 'spicy' ? 'Spicy' : 'Estándar'}</span>
            <span className="chip">{etiquetaModalidad(fila.modalidad)}</span>
            <span className="chip !bg-rosa-acento/15 !text-rosa-acento">
              {etiquetaEfecto(fila.efecto)}
            </span>
          </div>
          {estado?.error && <p className="mt-1 text-xs text-rosa-acento">{estado.mensaje}</p>}
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
              className="rounded-full bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              <Icono.lapiz className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              aria-label="Quitar plot twist del catálogo"
              className="rounded-full bg-white/10 p-2 text-white/60 transition hover:bg-rosa-acento/20 hover:text-rosa-acento"
            >
              <Icono.papelera className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
