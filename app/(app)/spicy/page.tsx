// Modo Spicy (sección 4.7): toggle, aviso de privacidad y catálogo Spicy jugable
// Implementa BJ2-030, BJ2-031, BJ2-032, BJ2-033
import Link from 'next/link';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerUsuarioActual, exigirParejaVinculada } from '@/lib/datos';
import { PanelSpicy } from './PanelSpicy';
import { WidgetCarta } from '@/components/widgets/WidgetCarta';

export const metadata = { title: 'Modo Spicy' };

export default async function SpicyPage() {
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();
  const supabase = crearClienteServidor();

  let cartasSpicy: { id: string; texto: string }[] = [];
  if (usuario.modo_spicy_activo) {
    const { data } = await supabase
      .from('catalogo_cartas')
      .select('id, texto, modalidad')
      .eq('tipo', 'spicy')
      .eq('activo', true)
      .in('modalidad', [pareja.modalidad, 'todas']);
    cartasSpicy = (data ?? []).map((c) => ({ id: c.id, texto: c.texto }));
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/dashboard" className="text-sm font-semibold text-morado-marca/60">
        ← Volver
      </Link>

      <header>
        <h1 className="text-2xl">🌶️ Modo Spicy</h1>
        <p className="text-sm text-morado-marca/70">
          Un extra para mayores de edad, independiente de tus 5 cartas semanales. Puedes
          jugar estas cartas cuando quieran.
        </p>
      </header>

      <PanelSpicy
        activo={usuario.modo_spicy_activo}
        puedeActivar={usuario.confirmo_mayor_edad}
      />

      {usuario.modo_spicy_activo && (
        <section>
          <h2 className="mb-2 text-lg">Catálogo Spicy · {pareja.modalidad}</h2>
          {cartasSpicy.length === 0 ? (
            <p className="text-sm text-morado-marca/60">
              Todavía no hay cartas Spicy cargadas para su modalidad.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {cartasSpicy.map((c) => (
                <WidgetCarta
                  key={c.id}
                  id={c.id}
                  texto={c.texto}
                  tipo="spicy"
                  rol="spicy-catalogo"
                  nombreCompanero={pareja.companero?.nombre}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
