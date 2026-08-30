// Dashboard: cuadrícula CSS Grid de widgets + la mano semanal como abanico de póker
// Implementa BJ2-017, BJ2-022, BJ2-026, BJ2-029, BJ2-033, BJ2-037
import Link from 'next/link';
import { obtenerDatosDashboard, obtenerUsuarioActual } from '@/lib/datos';
import { diasParaProximoReinicio } from '@/lib/reglas/ciclos';
import { WidgetCarta } from '@/components/widgets/WidgetCarta';
import { WidgetVSComparativo } from '@/components/widgets/WidgetVSComparativo';
import { WidgetReload } from '@/components/widgets/WidgetReload';
import { WidgetPlotTwist, type CartaObjetivo } from '@/components/widgets/WidgetPlotTwist';
import { AbanicoCartas, type CartaMano } from '@/components/widgets/AbanicoCartas';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Icono } from '@/components/ui/iconos';

export const metadata = { title: 'Tu baraja' };

export default async function DashboardPage() {
  const usuario = await obtenerUsuarioActual();
  const datos = await obtenerDatosDashboard();

  const mano: CartaMano[] = datos.misCartas
    .filter((c) => ['disponible', 'jugada', 'cumplida', 'bloqueada'].includes(c.estado))
    .map((c) => ({ id: c.id, texto: c.texto, tipo: c.tipo, estado: c.estado }));

  const cartasDisponibles = datos.misCartas.filter((c) => c.estado === 'disponible').length;

  const objetivos: CartaObjetivo[] = datos.cartasCompanero
    .filter((c) => c.estado === 'disponible')
    .map((c) => ({ id: c.id, texto: c.texto }));

  const dias = diasParaProximoReinicio(datos.pareja.fecha_vinculacion);
  const plotTwistsActivos = datos.misPlotTwists.filter((pt) => !pt.usado);

  return (
    <div className="flex flex-col gap-5">
      <AutoRefresh segundos={12} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">Semana {datos.cicloNumero}</h1>
          <p className="flex items-center gap-1.5 text-sm text-morado-marca/60">
            <Icono.reloj className="h-3.5 w-3.5" strokeWidth={2.5} />
            {dias > 0 ? `Cartas nuevas en ${dias} día(s)` : 'Reinicio pronto'}
          </p>
        </div>
        <Link
          href="/spicy"
          className="chip !text-xs shrink-0 border border-rosa-acento/20 !bg-rosa-acento/10"
        >
          <Icono.llama className="h-3.5 w-3.5" strokeWidth={2.5} />
          {usuario.modo_spicy_activo ? 'Spicy activo' : 'Modo Spicy'}
        </Link>
      </div>

      {/* Retos recibidos */}
      {datos.cartasRecibidas.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-lg">
            <Icono.sobre className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
            Retos que te jugaron
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {datos.cartasRecibidas.map((c, i) => (
              <WidgetCarta
                key={c.id}
                id={c.id}
                texto={c.texto}
                tipo={c.tipo}
                estado={c.estado}
                rol="recibida"
                indice={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Tu mano semanal como abanico */}
      <section className="rounded-widget border border-white/60 bg-gradient-to-br from-rosa-pastel/80 to-blanco-calido p-4 shadow-widget">
        <h2 className="flex items-center gap-2 text-lg">
          <Icono.mano className="h-4 w-4 text-vino-marca" strokeWidth={2.5} />
          Tu mano de la semana
        </h2>
        <p className="text-xs text-morado-marca/60">
          Toca una carta para jugarla con tu pareja.
        </p>
        <AbanicoCartas cartas={mano} nombreCompanero={datos.pareja.companero?.nombre} />
      </section>

      {/* Cuadrícula de widgets */}
      <div className="grid grid-cols-2 gap-4">
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

        {plotTwistsActivos.length > 0 && (
          <div className="col-span-2">
            <h2 className="mb-2 flex items-center gap-2 text-lg">
              <Icono.chispa className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
              Tus plot twists
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {plotTwistsActivos.map((pt) => (
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
          </div>
        )}

        <div className="col-span-2">
          <WidgetReload
            usado={datos.reloadUsado}
            diasParaReinicio={dias}
            cartasDisponibles={cartasDisponibles}
          />
        </div>
      </div>
    </div>
  );
}
