// Casa: UX estilo Tinder + estructura Clash Royale — pila de retos, mano en abanico y plot twists
// Implementa BJ2-017, BJ2-022, BJ2-026, BJ2-029, BJ2-033, BJ2-037
import { obtenerDatosDashboard } from '@/lib/datos';
import { diasParaProximoReinicio } from '@/lib/reglas/ciclos';
import { WidgetVSComparativo } from '@/components/widgets/WidgetVSComparativo';
import { WidgetReload } from '@/components/widgets/WidgetReload';
import { PilaRetos, type RetoRecibido } from '@/components/widgets/PilaRetos';
import { ManoFan, type CartaMano } from '@/components/widgets/ManoFan';
import { CampoBatalla, type CartaEnCampo } from '@/components/widgets/CampoBatalla';
import {
  PlotTwistsLane,
  type PlotTwistLane,
  type ObjetivoLane,
} from '@/components/widgets/PlotTwistsLane';
import { RevelacionPlotTwist } from '@/components/widgets/RevelacionPlotTwist';
import { AutoRefresh } from '@/components/AutoRefresh';
import { BannerSeccion } from '@/components/ui/BannerSeccion';
import { Icono } from '@/components/ui/iconos';

export const metadata = { title: 'Casa' };

export default async function DashboardPage() {
  const datos = await obtenerDatosDashboard();

  // Tu mano: solo las que todavía puedes jugar. En cuanto lanzas una, sale de aquí
  // (el mazo se hace más chico) y pasa al campo de batalla de abajo.
  const mano: CartaMano[] = datos.misCartas
    .filter((c) => c.estado === 'disponible')
    .map((c) => ({
      id: c.id,
      texto: c.texto,
      tipo: c.tipo,
      puntosOtorgados: c.puntosOtorgados,
    }));

  // Campo de batalla: las que ya lanzaste y siguen en juego, esperando que tu pareja
  // las cumpla (o que ya avisó y te toca confirmar).
  const cartasEnCampo: CartaEnCampo[] = datos.misCartas
    .filter((c) => c.estado === 'jugada')
    .map((c) => ({
      id: c.id,
      texto: c.texto,
      tipo: c.tipo,
      puntosOtorgados: c.puntosOtorgados,
      reclamada: !!c.reclamada_en,
    }));

  // Retos que tu pareja te jugó: los que aún no avisas ("toca el corazón cuando lo
  // cumplas") van a la pila; los que ya avisaste solo se muestran, esperando a que
  // ella confirme desde su mano.
  const retos: RetoRecibido[] = datos.cartasRecibidas
    .filter((c) => !c.reclamada_en)
    .map((c) => ({
      id: c.id,
      texto: c.texto,
      tipo: c.tipo,
      puntosOtorgados: c.puntosOtorgados,
      estado: c.estado,
    }));

  const retosEsperandoConfirmacion = datos.cartasRecibidas.filter((c) => c.reclamada_en);

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

  const cartasDisponibles = mano.length;
  const dias = diasParaProximoReinicio(datos.pareja.fecha_vinculacion);
  const nombre = datos.pareja.companero?.nombre;

  // Un plot twist te cayó encima (te bloquearon o robaron una carta) y todavía no
  // viste el aviso: se le muestra a la vez, una carta a la vez, para que no pase en
  // silencio.
  const plotTwistSinVer = datos.misCartas.find(
    (c) => (c.estado === 'bloqueada' || c.estado === 'robada') && !c.notificado_en,
  );

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh segundos={12} />

      {plotTwistSinVer && (
        <RevelacionPlotTwist
          carta={{
            id: plotTwistSinVer.id,
            texto: plotTwistSinVer.texto,
            tipo: plotTwistSinVer.tipo,
            efecto: plotTwistSinVer.estado as 'bloqueada' | 'robada',
          }}
          nombreCompanero={nombre}
        />
      )}

      {/* Lo que acabas de lanzar se queda viéndose aquí arriba, como en la mesa. */}
      <CampoBatalla cartas={cartasEnCampo} nombreCompanero={nombre} />

      <div className="text-center">
        <h1 className="text-2xl">Semana {datos.cicloNumero}</h1>
        <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[13px] font-bold text-menta">
          <Icono.reloj className="h-3.5 w-3.5" strokeWidth={2.5} />
          {dias > 0 ? `Cartas nuevas en ${dias} día(s)` : 'Reinicio muy pronto'}
        </p>
      </div>

      {retos.length > 0 && (
        <>
          <BannerSeccion icono={Icono.sobre}>Retos de {nombre ?? 'tu pareja'}</BannerSeccion>
          <PilaRetos retos={retos} nombreCompanero={nombre} />
        </>
      )}

      {retosEsperandoConfirmacion.length > 0 && (
        <section className="lane flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-white/60">
            <Icono.reloj className="h-3.5 w-3.5" strokeWidth={2.5} />
            Ya avisaste que cumpliste — esperando que {nombre ?? 'tu pareja'} confirme
          </p>
          {retosEsperandoConfirmacion.map((c) => (
            <p key={c.id} className="truncate text-sm text-white/80">
              {c.texto}
            </p>
          ))}
        </section>
      )}

      <BannerSeccion icono={Icono.mano}>Tu mano</BannerSeccion>
      <section className="lane">
        <ManoFan cartas={mano} nombreCompanero={nombre} />
      </section>

      {plotTwists.length > 0 && (
        <>
          <BannerSeccion icono={Icono.chispa}>Plot Twists</BannerSeccion>
          <PlotTwistsLane plotTwists={plotTwists} objetivos={objetivos} />
        </>
      )}

      <BannerSeccion icono={Icono.corona}>Marcador</BannerSeccion>
      <WidgetVSComparativo
        yo={{
          nombre: datos.pareja.yo.nombre,
          avatarId: datos.pareja.yo.avatar_id,
          fotoUrl: datos.pareja.yo.avatar_foto_url,
          puntos: datos.misPuntos,
        }}
        companero={
          datos.pareja.companero
            ? {
                nombre: datos.pareja.companero.nombre,
                avatarId: datos.pareja.companero.avatar_id,
                fotoUrl: datos.pareja.companero.avatar_foto_url,
                puntos: datos.puntosCompanero,
              }
            : null
        }
      />

      <WidgetReload
        usado={datos.reloadUsado}
        diasParaReinicio={dias}
        cartasDisponibles={cartasDisponibles}
        modoTester={datos.pareja.yo.modo_tester}
      />
    </div>
  );
}
