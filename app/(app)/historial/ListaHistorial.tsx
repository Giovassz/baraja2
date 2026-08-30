// Lista de eventos con filtro por tipo (Fase 8)
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
  fecha: string;
}

type Filtro = 'todos' | TipoEventoHistorial;

const FILTROS: { valor: Filtro; etiqueta: string; icono?: typeof Icono.check }[] = [
  { valor: 'todos', etiqueta: 'Todo' },
  { valor: 'carta_cumplida', etiqueta: 'Cartas cumplidas', icono: Icono.cumplida },
  { valor: 'plot_twist_usado', etiqueta: 'Plot twists', icono: Icono.chispa },
];

export function ListaHistorial({ eventos }: { eventos: EventoHistorial[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const visibles =
    filtro === 'todos' ? eventos : eventos.filter((e) => e.tipoEvento === filtro);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const Ico = f.icono;
          return (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition ${
                filtro === f.valor
                  ? 'bg-rosa-acento text-white'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {Ico && <Ico className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {f.etiqueta}
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="text-sm text-white/60">
          Todavía no hay eventos aquí. Cumplan retos para empezar su historia.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibles.map((e) => (
            <WidgetHistorialEvento
              key={e.id}
              tipoEvento={e.tipoEvento}
              descripcion={e.descripcion}
              autor={e.autor}
              fecha={e.fecha}
            />
          ))}
        </div>
      )}
    </div>
  );
}
