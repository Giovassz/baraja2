// Lista de eventos con filtro por tipo (Fase 8)
// Rediseño: selector de filtro tipo pastilla conectada (referencia: ranking de
// Preguntados) + filas mejor estructuradas en WidgetHistorialEvento.
// Implementa BJ2-047
'use client';

import { useState } from 'react';
import { WidgetHistorialEvento } from '@/components/widgets/WidgetHistorialEvento';
import { Icono } from '@/components/ui/iconos';
import type { TipoEventoHistorial } from '@/lib/supabase/tipos';

export interface EventoHistorial {
  id: string;
  tipoEvento: TipoEventoHistorial;
  descripcion: string;
  autor: string;
  avatarId: string | null;
  fotoUrl: string | null;
  fecha: string;
  /** La carta que el evento afectó — la cumplida, o la que un plot twist bloqueó/robó. */
  cartaAfectada: {
    texto: string;
    tipo: 'estandar' | 'spicy';
    puntosOtorgados: number;
    /** De quién era la carta (solo aplica a plot twists). */
    propietario: string | null;
    /** Si era una carta-pregunta, lo que se respondió por escrito. */
    respuestaTexto: string | null;
  } | null;
}

type Filtro = 'todos' | TipoEventoHistorial;

const FILTROS: { valor: Filtro; etiqueta: string; icono?: typeof Icono.check }[] = [
  { valor: 'todos', etiqueta: 'Todo' },
  { valor: 'carta_cumplida', etiqueta: 'Cumplidas', icono: Icono.cumplida },
  { valor: 'plot_twist_usado', etiqueta: 'Plot twists', icono: Icono.chispa },
];

export function ListaHistorial({ eventos }: { eventos: EventoHistorial[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const visibles =
    filtro === 'todos' ? eventos : eventos.filter((e) => e.tipoEvento === filtro);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-full bg-white/[0.06] p-1">
        {FILTROS.map((f) => {
          const Ico = f.icono;
          const activo = filtro === f.valor;
          return (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition sm:text-sm ${
                activo
                  ? 'bg-rosa-acento text-white shadow-[0_6px_16px_-6px_rgb(var(--c-acento)/0.7)]'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              {Ico && <Ico className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {f.etiqueta}
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/50">
          Todavía no hay eventos aquí. Cumplan retos para empezar su historia.
        </p>
      ) : (
        <div className="overflow-hidden rounded-widget border border-white/10">
          {visibles.map((e, i) => (
            <WidgetHistorialEvento key={e.id} evento={e} ultimo={i === visibles.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
