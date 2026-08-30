// Widget de un evento de la línea de tiempo (sección 5 / Fase 8)
// Implementa BJ2-045, BJ2-046
import type { TipoEventoHistorial } from '@/lib/supabase/tipos';

const CONFIG: Record<
  TipoEventoHistorial,
  { emoji: string; gradiente: string; etiqueta: string }
> = {
  carta_cumplida: {
    emoji: '✅',
    gradiente: 'from-menta to-blanco-calido',
    etiqueta: 'Carta cumplida',
  },
  plot_twist_usado: {
    emoji: '🎭',
    gradiente: 'from-rosa-acento/20 to-blanco-calido',
    etiqueta: 'Plot twist',
  },
};

export function WidgetHistorialEvento({
  tipoEvento,
  descripcion,
  autor,
  fecha,
}: {
  tipoEvento: TipoEventoHistorial;
  descripcion: string;
  autor: string;
  fecha: string;
}) {
  const cfg = CONFIG[tipoEvento];
  const cuando = new Date(fecha).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className={`widget bg-gradient-to-br ${cfg.gradiente}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{cfg.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-vino-marca">
            {cfg.etiqueta}
          </p>
          <p className="mt-0.5 text-sm text-morado-marca">{descripcion}</p>
          <p className="mt-1 text-xs text-morado-marca/60">
            {autor} · {cuando}
          </p>
        </div>
      </div>
    </article>
  );
}
