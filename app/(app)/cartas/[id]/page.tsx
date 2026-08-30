// Detalle de una carta asignada (sección 2)
// Implementa BJ2-017
import { notFound } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerUsuarioActual, exigirParejaVinculada } from '@/lib/datos';
import { WidgetCarta } from '@/components/widgets/WidgetCarta';
import { EnlaceVolver } from '@/components/ui/EncabezadoPagina';

export const metadata = { title: 'Carta' };

export default async function CartaDetallePage({ params }: { params: { id: string } }) {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();

  const { data: carta } = await supabase
    .from('cartas_asignadas')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!carta || carta.pareja_id !== pareja.id) notFound();

  const { data: cat } = await supabase
    .from('catalogo_cartas')
    .select('texto, tipo')
    .eq('id', carta.carta_id)
    .single();

  const esMia = carta.usuario_id === usuario.id;
  const esRecibida = carta.jugada_hacia_usuario_id === usuario.id;

  return (
    <div className="mx-auto flex max-w-xs flex-col gap-4">
      <EnlaceVolver />

      <WidgetCarta
        id={carta.id}
        texto={cat?.texto ?? 'Carta'}
        tipo={(cat?.tipo as 'estandar' | 'spicy') ?? 'estandar'}
        estado={carta.estado}
        rol={esRecibida ? 'recibida' : esMia ? 'propia' : 'companero'}
        nombreCompanero={pareja.companero?.nombre}
      />
    </div>
  );
}
