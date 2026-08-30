// Widget VS: avatares enfrentados + anillo de progreso por jugador + etiqueta textual (sección 5)
// Implementa BJ2-026
import { Avatar } from '@/components/ui/Avatar';
import { AnilloProgreso } from '@/components/ui/AnilloProgreso';
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
    <article className="widget col-span-2 bg-gradient-to-br from-lavanda to-blanco-calido">
      <h3 className="text-center text-lg">Marcador de la semana</h3>
      <div className="mt-4 flex items-start justify-around gap-2">
        <LadoJugador jugador={yo} etiquetaLado="Tú" />
        <span className="mt-8 font-heading text-2xl text-rosa-acento">VS</span>
        {companero ? (
          <LadoJugador jugador={companero} etiquetaLado={companero.nombre} />
        ) : (
          <div className="w-24 text-center text-xs text-morado-marca/50">
            Esperando a tu pareja
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-morado-marca/60">
        Cada {PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST} puntos desbloqueas un plot twist.
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
      <AnilloProgreso progreso={progreso} tamano={80}>
        <Avatar avatarId={jugador.avatarId} nombre={jugador.nombre} tamano={52} />
      </AnilloProgreso>
      <p className="font-heading text-sm text-morado-marca">{etiquetaLado}</p>
      <p className="font-heading text-2xl text-rosa-acento">{jugador.puntos}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-vino-marca">
        {etiqueta}
      </p>
      {plotTwists > 0 && (
        <p className="text-[11px] text-morado-marca/60">🎭 {plotTwists} plot twist(s)</p>
      )}
    </div>
  );
}
