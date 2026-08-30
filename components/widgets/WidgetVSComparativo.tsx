// Widget VS: avatares enfrentados + anillo de progreso por jugador + etiqueta textual (sección 5)
// Implementa BJ2-026
import { Avatar } from '@/components/ui/Avatar';
import { AnilloProgreso } from '@/components/ui/AnilloProgreso';
import { Icono } from '@/components/ui/iconos';
import {
  progresoHaciaPlotTwist,
  etiquetaProgreso,
  plotTwistsMerecidos,
} from '@/lib/reglas/puntos';
import { PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST } from '@/lib/reglas/constantes';

interface Jugador {
  nombre: string;
  avatarId: string | null;
  puntos: number;
}

export function WidgetVSComparativo({
  yo,
  companero,
}: {
  yo: Jugador;
  companero: Jugador | null;
}) {
  return (
    <article className="widget widget-lavanda col-span-2 destello">
      <div className="flex items-center justify-center gap-2">
        <Icono.espadas className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
        <h3 className="text-center text-lg">Marcador de la semana</h3>
      </div>

      <div className="mt-4 flex items-start justify-around gap-2">
        <LadoJugador jugador={yo} etiquetaLado="Tú" />
        <span className="mt-9 font-heading text-xl font-bold text-rosa-acento">VS</span>
        {companero ? (
          <LadoJugador jugador={companero} etiquetaLado={companero.nombre} />
        ) : (
          <div className="w-24 pt-8 text-center text-xs text-white/50">
            Esperando a tu pareja
          </div>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-white/60">
        <Icono.chispa className="h-3.5 w-3.5" strokeWidth={2.5} />
        Cada {PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST} puntos desbloqueas un plot twist
      </p>
    </article>
  );
}

function LadoJugador({ jugador, etiquetaLado }: { jugador: Jugador; etiquetaLado: string }) {
  const progreso = progresoHaciaPlotTwist(jugador.puntos);
  const etiqueta = etiquetaProgreso(progreso);
  const plotTwists = plotTwistsMerecidos(jugador.puntos);

  return (
    <div className="flex w-24 flex-col items-center gap-2 text-center">
      <AnilloProgreso progreso={progreso} tamano={82}>
        <Avatar avatarId={jugador.avatarId} nombre={jugador.nombre} tamano={54} anillo={false} />
      </AnilloProgreso>
      <p className="max-w-full truncate font-heading text-sm text-white">
        {etiquetaLado}
      </p>
      <p className="font-heading text-2xl font-bold text-rosa-acento">{jugador.puntos}</p>
      <span className="chip">{etiqueta}</span>
      {plotTwists > 0 && (
        <p className="flex items-center gap-1 text-[11px] text-white/60">
          <Icono.chispa className="h-3 w-3" strokeWidth={2.5} /> {plotTwists}
        </p>
      )}
    </div>
  );
}
