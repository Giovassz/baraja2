// Dashboard: cuadrícula CSS Grid de widgets independientes (sección 5)
// Implementa BJ2-017, BJ2-022, BJ2-026, BJ2-029, BJ2-033, BJ2-037
import Link from 'next/link';
import { obtenerDatosDashboard, obtenerUsuarioActual } from '@/lib/datos';
import { diasParaProximoReinicio } from '@/lib/reglas/ciclos';
import { WidgetCarta } from '@/components/widgets/WidgetCarta';
import { WidgetVSComparativo } from '@/components/widgets/WidgetVSComparativo';
import { WidgetReload } from '@/components/widgets/WidgetReload';
import { WidgetPlotTwist, type CartaObjetivo } from '@/components/widgets/WidgetPlotTwist';
import { AutoRefresh } from '@/components/AutoRefresh';

export const metadata = { title: 'Tu baraja' };

export default async function DashboardPage() {
  const usuario = await obtenerUsuarioActual();
  const datos = await obtenerDatosDashboard();

  const cartasMostrables = datos.misCartas.filter((c) =>
    ['disponible', 'jugada', 'cumplida', 'bloqueada'].includes(c.estado),
  );

  const cartasDisponibles = datos.misCartas.filter((c) => c.estado === 'disponible').length;

  // Cartas de la pareja que un plot twist puede tener como objetivo (disponibles).
  const objetivos: CartaObjetivo[] = datos.cartasCompanero
    .filter((c) => c.estado === 'disponible')
    .map((c) => ({ id: c.id, texto: c.texto }));

  const dias = diasParaProximoReinicio(datos.pareja.fecha_vinculacion);

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh segundos={12} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Semana {datos.cicloNumero}</h1>
          <p className="text-sm text-morado-marca/60">
            {dias > 0 ? `Cartas nuevas en ${dias} día(s)` : 'Reinicio pronto'}
          </p>
        </div>
        <Link
          href="/spicy"
          className="rounded-full bg-rosa-acento/15 px-3 py-1 text-sm font-semibold text-vino-marca"
        >
          {usuario.modo_spicy_activo ? '🌶️ Spicy activo' : 'Modo Spicy'}
        </Link>
      </div>

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

        {datos.cartasRecibidas.length > 0 && (
          <div className="col-span-2">
            <h2 className="mb-2 text-lg">Retos que te jugaron</h2>
            <div className="grid grid-cols-2 gap-4">
              {datos.cartasRecibidas.map((c) => (
                <WidgetCarta
                  key={c.id}
                  id={c.id}
                  texto={c.texto}
                  tipo={c.tipo}
                  estado={c.estado}
                  rol="recibida"
                />
              ))}
            </div>
          </div>
        )}

        {datos.misPlotTwists.filter((pt) => !pt.usado).length > 0 && (
          <div className="col-span-2">
            <h2 className="mb-2 text-lg">Tus plot twists</h2>
            <div className="grid grid-cols-2 gap-4">
              {datos.misPlotTwists
                .filter((pt) => !pt.usado)
                .map((pt) => (
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
          <h2 className="mb-2 text-lg">Tus 5 cartas</h2>
          <div className="grid grid-cols-2 gap-4">
            {cartasMostrables.map((c) => (
              <WidgetCarta
                key={c.id}
                id={c.id}
                texto={c.texto}
                tipo={c.tipo}
                estado={c.estado}
                rol="propia"
                nombreCompanero={datos.pareja.companero?.nombre}
              />
            ))}
            {cartasMostrables.length === 0 && (
              <p className="col-span-2 text-sm text-morado-marca/60">
                Todavía no tienes cartas para esta semana. Vuelve en un momento.
              </p>
            )}
          </div>
        </div>

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
