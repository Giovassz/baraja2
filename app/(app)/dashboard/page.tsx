// Casa: UX estilo Tinder — pila de retos recibidos + tu mano en abanico + plot twists
// Implementa BJ2-017, BJ2-022, BJ2-026, BJ2-029, BJ2-033, BJ2-037
import { obtenerDatosDashboard } from '@/lib/datos';
import { diasParaProximoReinicio } from '@/lib/reglas/ciclos';
import { WidgetVSComparativo } from '@/components/widgets/WidgetVSComparativo';
import { WidgetReload } from '@/components/widgets/WidgetReload';
import { PilaRetos, type RetoRecibido } from '@/components/widgets/PilaRetos';
import { ManoFan, type CartaMano } from '@/components/widgets/ManoFan';
import {
  PlotTwistsLane,
  type PlotTwistLane,
  type ObjetivoLane,
} from '@/components/widgets/PlotTwistsLane';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Icono } from '@/components/ui/iconos';

export const metadata = { title: 'Casa' };

export default async function DashboardPage() {
  const datos = await obtenerDatosDashboard();

  const mano: CartaMano[] = datos.misCartas
    .filter((c) => ['disponible', 'jugada', 'cumplida', 'bloqueada'].includes(c.estado))
    .map((c) => ({
      id: c.id,
      texto: c.texto,
      tipo: c.tipo,
      puntosOtorgados: c.puntosOtorgados,
      estado: c.estado,
    }));

  const retos: RetoRecibido[] = datos.cartasRecibidas.map((c) => ({
    id: c.id,
    texto: c.texto,
    tipo: c.tipo,
    puntosOtorgados: c.puntosOtorgados,
    estado: c.estado,
  }));

  const plotTwists: PlotTwistLane[] = datos.misPlotTwists
    .filter((pt) => !pt.usado)
    .map((pt) => ({
      id: pt.id,
      nombre: pt.nombre,
      descripcion: pt.descripcion,
      efecto: pt.efecto as PlotTwistLane['efecto'],
    }));

  const objetivos: ObjetivoLane[] = datos.cartasCompanero
    .filter((c) => c.estado === 'disponible')
    .map((c) => ({ id: c.id, texto: c.texto }));

  const cartasDisponibles = datos.misCartas.filter((c) => c.estado === 'disponible').length;
  const dias = diasParaProximoReinicio(datos.pareja.fecha_vinculacion);

  return (
    <div className="flex flex-col gap-5">
      <AutoRefresh segundos={12} />

      <div>
        <h1 className="text-2xl">Semana {datos.cicloNumero}</h1>
        <p className="flex items-center gap-1.5 text-sm text-white/45">
          <Icono.reloj className="h-3.5 w-3.5" strokeWidth={2.5} />
          {dias > 0 ? `Cartas nuevas en ${dias} día(s)` : 'Reinicio pronto'}
        </p>
      </div>

      {retos.length > 0 && (
        <PilaRetos retos={retos} nombreCompanero={datos.pareja.companero?.nombre} />
      )}

      <section className="lane">
        <span className="lane-titulo">
          <Icono.mano className="h-3 w-3" strokeWidth={2.5} />
          Tu mano
        </span>
        <ManoFan cartas={mano} nombreCompanero={datos.pareja.companero?.nombre} />
      </section>

      <PlotTwistsLane plotTwists={plotTwists} objetivos={objetivos} />

      <WidgetVSComparativo
        yo={{
          nombre: datos.pareja.yo.nombre,
          avatarId: datos.pareja.yo.avatar_id,
          puntos: datos.misPuntos,
        }}
        companero={
          datos.pareja.companero
            ? {
                nombre: datos.pareja.companero.nombre,
                avatarId: datos.pareja.companero.avatar_id,
                puntos: datos.puntosCompanero,
              }
            : null
        }
      />

      <WidgetReload
        usado={datos.reloadUsado}
        diasParaReinicio={dias}
        cartasDisponibles={cartasDisponibles}
      />
    </div>
  );
}
