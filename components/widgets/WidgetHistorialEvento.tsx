// Widget de un evento de la línea de tiempo (sección 5 / Fase 8)
// Implementa BJ2-045, BJ2-046
import { Icono, type LucideIcon } from '@/components/ui/iconos';
import type { TipoEventoHistorial } from '@/lib/supabase/tipos';

const CONFIG: Record<
  TipoEventoHistorial,
  { icono: LucideIcon; clase: string; etiqueta: string }
> = {
  carta_cumplida: {
    icono: Icono.cumplida,
    clase: 'widget-menta',
    etiqueta: 'Carta cumplida',
  },
  plot_twist_usado: {
    icono: Icono.chispa,
    clase: 'widget-acento',
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
  const Ico = cfg.icono;
  const cuando = new Date(fecha).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className={`widget ${cfg.clase} !p-4`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full bg-white/70 p-2 text-vino-marca">
          <Ico className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="chip !bg-transparent !px-0">{cfg.etiqueta}</p>
          <p className="mt-0.5 text-sm text-morado-marca">{descripcion}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-morado-marca/60">
            <Icono.reloj className="h-3 w-3" strokeWidth={2.5} />
            {autor} · {cuando}
          </p>
        </div>
      </div>
    </article>
  );
}
