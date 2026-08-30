// Casa: mesa de batalla estilo TCG con tus cartas, los retos recibidos y tus plot twists
// Implementa BJ2-017, BJ2-022, BJ2-026, BJ2-029, BJ2-033, BJ2-037
import { obtenerDatosDashboard } from '@/lib/datos';
import { diasParaProximoReinicio } from '@/lib/reglas/ciclos';
import { WidgetVSComparativo } from '@/components/widgets/WidgetVSComparativo';
import { WidgetReload } from '@/components/widgets/WidgetReload';
import {
  MesaBatalla,
  type CartaMesa,
  type PlotTwistMesa,
  type Objetivo,
} from '@/components/widgets/MesaBatalla';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Icono } from '@/components/ui/iconos';

export const metadata = { title: 'Casa' };

export default async function DashboardPage() {
  const datos = await obtenerDatosDashboard();

  const aMesa = (c: (typeof datos.misCartas)[number]): CartaMesa => ({
    id: c.id,
    texto: c.texto,
    tipo: c.tipo,
    puntosOtorgados: c.puntosOtorgados,
    estado: c.estado,
  });

  const mano = datos.misCartas
    .filter((c) => ['disponible', 'jugada', 'cumplida', 'bloqueada'].includes(c.estado))
    .map(aMesa);

  const recibidas = datos.cartasRecibidas.map(aMesa);

  const plotTwists: PlotTwistMesa[] = datos.misPlotTwists
    .filter((pt) => !pt.usado)
    .map((pt) => ({
      id: pt.id,
      nombre: pt.nombre,
      descripcion: pt.descripcion,
      efecto: pt.efecto as PlotTwistMesa['efecto'],
    }));

  const objetivos: Objetivo[] = datos.cartasCompanero
    .filter((c) => c.estado === 'disponible')
    .map((c) => ({ id: c.id, texto: c.texto }));

  const cartasDisponibles = datos.misCartas.filter((c) => c.estado === 'disponible').length;
  const dias = diasParaProximoReinicio(datos.pareja.fecha_vinculacion);

  return (
    <div className="flex flex-col gap-5">
      <AutoRefresh segundos={12} />

      <div>
        <h1 className="text-2xl">Semana {datos.cicloNumero}</h1>
        <p className="flex items-center gap-1.5 text-sm text-morado-marca/60">
          <Icono.reloj className="h-3.5 w-3.5" strokeWidth={2.5} />
          {dias > 0 ? `Cartas nuevas en ${dias} día(s)` : 'Reinicio pronto'}
        </p>
      </div>

      <MesaBatalla
        mano={mano}
        recibidas={recibidas}
        plotTwists={plotTwists}
        objetivos={objetivos}
        nombreCompanero={datos.pareja.companero?.nombre}
      />

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
