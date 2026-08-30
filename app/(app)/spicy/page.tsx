// Modo Spicy (sección 4.7): toggle, aviso de privacidad y catálogo Spicy jugable
// Implementa BJ2-030, BJ2-031, BJ2-032, BJ2-033
import { crearClienteServidor } from '@/lib/supabase/server';
import {
  obtenerUsuarioActual,
  exigirParejaVinculada,
  etiquetaModalidad,
} from '@/lib/datos';
import { PanelSpicy } from './PanelSpicy';
import { CatalogoSpicy } from './CatalogoSpicy';
import { EnlaceVolver, TituloPagina } from '@/components/ui/EncabezadoPagina';
import { Icono } from '@/components/ui/iconos';

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
      <EnlaceVolver href="/perfil" />
      <TituloPagina
        icono={Icono.llama}
        subtitulo="Un extra para mayores de edad, independiente de tus 5 cartas semanales. Puedes jugar estas cartas cuando quieran."
      >
        Modo Spicy
      </TituloPagina>

      <PanelSpicy
        activo={usuario.modo_spicy_activo}
        puedeActivar={usuario.confirmo_mayor_edad}
      />

      {usuario.modo_spicy_activo && (
        <section>
          <h2 className="mb-2 text-lg">
            Catálogo Spicy · {etiquetaModalidad(pareja.modalidad)}
          </h2>
          <CatalogoSpicy
            cartas={cartasSpicy}
            nombreCompanero={pareja.companero?.nombre}
          />
        </section>
      )}
    </div>
  );
}
