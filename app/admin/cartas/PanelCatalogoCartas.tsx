// UI del catálogo de cartas para /admin/cartas: agregar en bloque (una carta por
// línea) y quitar cartas existentes una por una.
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { BotonEnviar, Boton } from '@/components/ui/Boton';
import { Icono } from '@/components/ui/iconos';
import {
  agregarCartasCatalogo,
  desactivarCartaCatalogo,
  editarCartaCatalogo,
} from '@/lib/actions/admin';

export interface FilaCarta {
  id: string;
  texto: string;
  tipo: 'estandar' | 'spicy';
  modalidad: 'distancia' | 'hibrida' | 'fisica' | 'todas';
  puntos: number;
}

const TIPOS: { valor: FilaCarta['tipo']; etiqueta: string }[] = [
  { valor: 'estandar', etiqueta: 'Estándar' },
  { valor: 'spicy', etiqueta: 'Spicy' },
];

const MODALIDADES: { valor: FilaCarta['modalidad']; etiqueta: string }[] = [
  { valor: 'distancia', etiqueta: 'A distancia' },
  { valor: 'hibrida', etiqueta: 'Híbrida' },
  { valor: 'fisica', etiqueta: 'Presencial' },
  { valor: 'todas', etiqueta: 'Cualquier modalidad' },
];

function etiquetaModalidad(m: FilaCarta['modalidad']): string {
  return MODALIDADES.find((x) => x.valor === m)?.etiqueta ?? m;
}

export function PanelCatalogoCartas({ filas }: { filas: FilaCarta[] }) {
  const [filtroTipo, setFiltroTipo] = useState<'' | FilaCarta['tipo']>('');
  const [filtroModalidad, setFiltroModalidad] = useState<'' | FilaCarta['modalidad']>('');

  const filasFiltradas = useMemo(
    () =>
      filas.filter(
        (f) =>
          (filtroTipo === '' || f.tipo === filtroTipo) &&
          (filtroModalidad === '' || f.modalidad === filtroModalidad),
      ),
    [filas, filtroTipo, filtroModalidad],
  );

  return (
    <div className="flex flex-col gap-5">
      <FormularioAgregar />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg">
            En el catálogo <span className="text-white/40">({filasFiltradas.length})</span>
          </h2>
        </div>

        <div className="flex gap-2">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as typeof filtroTipo)}
            className="campo-texto !py-2 text-sm"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
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
        </div>

        {filasFiltradas.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/50">No hay cartas con ese filtro.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filasFiltradas.map((f) => (
              <FilaCartaCatalogo key={f.id} fila={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FormularioAgregar() {
  const [estado, accion] = useFormState(agregarCartasCatalogo, null);

  return (
    <form action={accion} className="widget flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg">
        <Icono.regalo className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
        Agregar cartas
      </h2>

      <div className="flex gap-2">
        <select name="tipo" defaultValue="estandar" className="campo-texto !py-2 text-sm">
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
        <select name="modalidad" defaultValue="todas" className="campo-texto !py-2 text-sm">
          {MODALIDADES.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="puntos"
          defaultValue={1}
          min={1}
          max={10}
          className="campo-texto !w-20 !py-2 text-sm"
          aria-label="Puntos"
        />
      </div>

      <textarea
        name="lineas"
        rows={6}
        placeholder={'Una carta por línea, por ejemplo:\nEscríbanse una carta de amor.\nCocinen algo nuevo juntos.'}
        className="campo-texto resize-y text-sm"
      />

      {estado?.error && <p className="text-sm text-rosa-acento">{estado.mensaje}</p>}
      {estado?.ok && <p className="text-sm text-white/70">{estado.mensaje}</p>}

      <BotonEnviar className="w-full">Agregar al catálogo</BotonEnviar>
    </form>
  );
}

function FilaCartaCatalogo({ fila }: { fila: FilaCarta }) {
  const [confirmando, setConfirmando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [estado, accion] = useFormState(desactivarCartaCatalogo, null);
  const [estadoEditar, accionEditar] = useFormState(editarCartaCatalogo, null);

  // Cerrar el modo edición cuando el guardado sale bien (con efecto, no en el
  // cuerpo del render — si no, la próxima vez que se abra "editar" se cerraría
  // solo, porque el estado de useFormState no vuelve a null por su cuenta).
  useEffect(() => {
    if (estadoEditar?.ok) setEditando(false);
  }, [estadoEditar]);

  if (editando) {
    return (
      <form action={accionEditar} className="widget flex flex-col gap-2 !p-3">
        <input type="hidden" name="id" value={fila.id} />
        <textarea
          name="texto"
          defaultValue={fila.texto}
          rows={2}
          className="campo-texto resize-y text-sm"
        />
        <div className="flex gap-2">
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
          <input
            type="number"
            name="puntos"
            defaultValue={fila.puntos}
            min={1}
            max={10}
            className="campo-texto !w-16 !py-2 text-sm"
            aria-label="Puntos"
          />
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
          <p className="text-sm text-white/90">{fila.texto}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="chip">{fila.tipo === 'spicy' ? 'Spicy' : 'Estándar'}</span>
            <span className="chip">{etiquetaModalidad(fila.modalidad)}</span>
            <span className="chip !bg-rosa-acento/15 !text-rosa-acento">
              {fila.puntos} pt{fila.puntos === 1 ? '' : 's'}
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
              aria-label="Editar carta"
              className="rounded-full bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              <Icono.lapiz className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              aria-label="Quitar carta del catálogo"
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
