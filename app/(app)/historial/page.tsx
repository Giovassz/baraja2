// Línea de tiempo de eventos de la pareja (Fase 8), orden cronológico descendente
// Implementa BJ2-045, BJ2-046, BJ2-047
import Link from 'next/link';
import { crearClienteServidor } from '@/lib/supabase/server';
import { exigirParejaVinculada } from '@/lib/datos';
import { ListaHistorial, type EventoHistorial } from './ListaHistorial';

export const metadata = { title: 'Historial' };

export default async function HistorialPage() {
  const supabase = crearClienteServidor();
  const pareja = await exigirParejaVinculada();

  const { data: eventos } = await supabase
    .from('historial_eventos')
    .select('*')
    .eq('pareja_id', pareja.id)
    .order('created_at', { ascending: false })
    .limit(200);

  const nombres = new Map<string, string>();
  nombres.set(pareja.yo.id, pareja.yo.nombre);
  if (pareja.companero) nombres.set(pareja.companero.id, pareja.companero.nombre);

  const items: EventoHistorial[] = (eventos ?? []).map((e) => ({
    id: e.id,
    tipoEvento: e.tipo_evento,
    descripcion: e.descripcion,
    autor: nombres.get(e.usuario_id) ?? 'Alguien',
    fecha: e.created_at,
  }));

  return (
    <div className="flex flex-col gap-4">
      <Link href="/dashboard" className="text-sm font-semibold text-morado-marca/60">
        ← Volver
      </Link>
      <h1 className="text-2xl">Su historia juntos</h1>
      <ListaHistorial eventos={items} />
    </div>
  );
}
