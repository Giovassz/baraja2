// Línea de tiempo de eventos de la pareja (Fase 8), orden cronológico descendente
// Implementa BJ2-045, BJ2-046, BJ2-047
import { crearClienteServidor } from '@/lib/supabase/server';
import { exigirParejaVinculada } from '@/lib/datos';
import { ListaHistorial, type EventoHistorial } from './ListaHistorial';
import { TituloPagina } from '@/components/ui/EncabezadoPagina';
import { Icono } from '@/components/ui/iconos';

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

  const autores = new Map<string, { nombre: string; avatarId: string | null; fotoUrl: string | null }>();
  autores.set(pareja.yo.id, {
    nombre: pareja.yo.nombre,
    avatarId: pareja.yo.avatar_id,
    fotoUrl: pareja.yo.avatar_foto_url,
  });
  if (pareja.companero) {
    autores.set(pareja.companero.id, {
      nombre: pareja.companero.nombre,
      avatarId: pareja.companero.avatar_id,
      fotoUrl: pareja.companero.avatar_foto_url,
    });
  }

  // Para mostrar la carta de verdad (no solo el texto suelto) hay que reconstruirla:
  // - carta_cumplida: referencia_id ES el id en cartas_asignadas.
  // - plot_twist_usado: referencia_id es el id en plot_twists_desbloqueados, cuyo
  //   carta_objetivo_id apunta a la carta que el plot twist afectó (la bloqueada o
  //   robada) — no la carta del propio plot twist, que no tiene "cara" de carta. Esa
  //   fila ORIGINAL conserva su usuario_id de siempre (a quién se le bloqueó/robó),
  //   aunque su estado ya diga 'bloqueada'/'robada' — de ahí sacamos "de quién era".
  const idsCartaCumplida = (eventos ?? [])
    .filter((e) => e.tipo_evento === 'carta_cumplida')
    .map((e) => e.referencia_id);
  const idsPlotTwistUsado = (eventos ?? [])
    .filter((e) => e.tipo_evento === 'plot_twist_usado')
    .map((e) => e.referencia_id);

  const { data: ptds } = idsPlotTwistUsado.length
    ? await supabase
        .from('plot_twists_desbloqueados')
        .select('id, carta_objetivo_id')
        .in('id', idsPlotTwistUsado)
    : { data: [] as { id: string; carta_objetivo_id: string | null }[] };

  const idsCartasAsignadas = Array.from(
    new Set([
      ...idsCartaCumplida,
      ...(ptds ?? []).map((p) => p.carta_objetivo_id).filter((id): id is string => !!id),
    ]),
  );

  const { data: asignadas } = idsCartasAsignadas.length
    ? await supabase
        .from('cartas_asignadas')
        .select('id, carta_id, usuario_id')
        .in('id', idsCartasAsignadas)
    : { data: [] as { id: string; carta_id: string; usuario_id: string }[] };

  const asignadaPorId = new Map((asignadas ?? []).map((a) => [a.id, a]));
  const idsCatalogo = Array.from(new Set((asignadas ?? []).map((a) => a.carta_id)));

  const { data: catalogo } = idsCatalogo.length
    ? await supabase
        .from('catalogo_cartas')
        .select('id, texto, tipo, puntos_otorgados')
        .in('id', idsCatalogo)
    : { data: [] as { id: string; texto: string; tipo: 'estandar' | 'spicy'; puntos_otorgados: number }[] };

  const cartaPorId = new Map((catalogo ?? []).map((c) => [c.id, c]));
  const objetivoPorPtd = new Map((ptds ?? []).map((p) => [p.id, p.carta_objetivo_id]));

  function cartaAfectadaDe(e: NonNullable<typeof eventos>[number]) {
    const idAsignada =
      e.tipo_evento === 'carta_cumplida'
        ? e.referencia_id
        : (objetivoPorPtd.get(e.referencia_id) ?? null);
    if (!idAsignada) return null;

    const asignada = asignadaPorId.get(idAsignada);
    const carta = asignada ? cartaPorId.get(asignada.carta_id) : undefined;
    if (!asignada || !carta) return null;

    return {
      texto: carta.texto,
      tipo: carta.tipo,
      puntosOtorgados: carta.puntos_otorgados,
      // Solo tiene sentido para plot twists: de quién era la carta bloqueada/robada.
      // En carta_cumplida el dueño ya es el "autor" del evento.
      propietario:
        e.tipo_evento === 'plot_twist_usado'
          ? (autores.get(asignada.usuario_id)?.nombre ?? null)
          : null,
    };
  }

  const items: EventoHistorial[] = (eventos ?? []).map((e) => {
    const autor = autores.get(e.usuario_id);
    return {
      id: e.id,
      tipoEvento: e.tipo_evento,
      descripcion: e.descripcion,
      autor: autor?.nombre ?? 'Alguien',
      avatarId: autor?.avatarId ?? null,
      fotoUrl: autor?.fotoUrl ?? null,
      fecha: e.created_at,
      cartaAfectada: cartaAfectadaDe(e),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <TituloPagina icono={Icono.corazones}>Su historia juntos</TituloPagina>
      <ListaHistorial eventos={items} />
    </div>
  );
}
