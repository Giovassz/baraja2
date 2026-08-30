// Todos los plot twists del ciclo actual (desbloqueados y usados)
// Implementa BJ2-023, BJ2-029
import { obtenerDatosDashboard } from '@/lib/datos';
import { WidgetPlotTwist, type CartaObjetivo } from '@/components/widgets/WidgetPlotTwist';
import { AutoRefresh } from '@/components/AutoRefresh';
import { EnlaceVolver, TituloPagina } from '@/components/ui/EncabezadoPagina';
import { Icono } from '@/components/ui/iconos';
import {
  puntosParaSiguientePlotTwist,
  plotTwistsMerecidos,
} from '@/lib/reglas/puntos';

export const metadata = { title: 'Plot twists' };

export default async function PlotTwistsPage() {
  const datos = await obtenerDatosDashboard();

  const objetivos: CartaObjetivo[] = datos.cartasCompanero
    .filter((c) => c.estado === 'disponible')
    .map((c) => ({ id: c.id, texto: c.texto }));

  const disponibles = datos.misPlotTwists.filter((pt) => !pt.usado);
  const usados = datos.misPlotTwists.filter((pt) => pt.usado);
  const faltan = puntosParaSiguientePlotTwist(datos.misPuntos);

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh segundos={12} />
      <EnlaceVolver />
      <TituloPagina
        icono={Icono.chispa}
        subtitulo={`Llevas ${datos.misPuntos} punto(s) este ciclo · ${plotTwistsMerecidos(
          datos.misPuntos,
        )} desbloqueado(s). Te faltan ${faltan} punto(s) para el siguiente.`}
      >
        Plot twists
      </TituloPagina>

      {disponibles.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg">Listos para usar</h2>
          <div className="grid grid-cols-2 gap-4">
            {disponibles.map((pt) => (
              <WidgetPlotTwist
                key={pt.id}
                id={pt.id}
                nombre={pt.nombre}
                descripcion={pt.descripcion}
                efecto={pt.efecto as 'bloquear_carta' | 'robar_carta' | 'otro'}
                usado={pt.usado}
                objetivos={objetivos}
              />
            ))}
          </div>
        </section>
      )}

      {usados.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg">Ya usados</h2>
          <div className="grid grid-cols-2 gap-4">
            {usados.map((pt) => (
              <WidgetPlotTwist
                key={pt.id}
                id={pt.id}
                nombre={pt.nombre}
                descripcion={pt.descripcion}
                efecto={pt.efecto as 'bloquear_carta' | 'robar_carta' | 'otro'}
                usado
                objetivos={[]}
              />
            ))}
          </div>
        </section>
      )}

      {datos.misPlotTwists.length === 0 && (
        <p className="text-sm text-morado-marca/60">
          Aún no has desbloqueado ningún plot twist. Cumple retos para ganar puntos.
        </p>
      )}
    </div>
  );
}
