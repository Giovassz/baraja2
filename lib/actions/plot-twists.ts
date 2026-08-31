// Server Actions de plot twists: usar para bloquear o robar una carta
// Implementa BJ2-027, BJ2-028
'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { esquemaUsoPlotTwist, esquemaCartaId } from '@/lib/validaciones/juego';
import { enviarPushAUsuario } from '@/lib/push';
import { obtenerParejaActual, obtenerUsuarioActual } from '@/lib/datos';
import { exito, fallo, codigoDesdeError, type ResultadoAccion } from './_resultado';

export async function usarPlotTwistBloquear(
  plotTwistDesbloqueadoId: string,
  cartaObjetivoId: string,
): Promise<ResultadoAccion> {
  const parsed = esquemaUsoPlotTwist.safeParse({
    plotTwistDesbloqueadoId,
    cartaObjetivoId,
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('usar_plot_twist_bloquear', {
    p_ptd_id: parsed.data.plotTwistDesbloqueadoId,
    p_carta_objetivo_id: parsed.data.cartaObjetivoId,
  });
  if (error) return fallo(codigoDesdeError(error));

  await avisarPlotTwistUsado('bloqueada');

  revalidatePath('/dashboard');
  revalidatePath('/historial');
  return exito('Bloqueaste esa carta por este ciclo.');
}

export async function usarPlotTwistRobar(
  plotTwistDesbloqueadoId: string,
  cartaObjetivoId: string,
): Promise<ResultadoAccion> {
  const parsed = esquemaUsoPlotTwist.safeParse({
    plotTwistDesbloqueadoId,
    cartaObjetivoId,
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('usar_plot_twist_robar', {
    p_ptd_id: parsed.data.plotTwistDesbloqueadoId,
    p_carta_objetivo_id: parsed.data.cartaObjetivoId,
  });
  if (error) return fallo(codigoDesdeError(error));

  await avisarPlotTwistUsado('robada');

  revalidatePath('/dashboard');
  revalidatePath('/historial');
  return exito('Robaste esa carta. Ahora es tuya.');
}

/** Aviso push a quien recibió el plot twist (best-effort, no bloquea la respuesta). */
async function avisarPlotTwistUsado(efecto: 'bloqueada' | 'robada'): Promise<void> {
  try {
    const pareja = await obtenerParejaActual();
    if (!pareja?.companero) return;
    await enviarPushAUsuario(pareja.companero.id, {
      titulo: '¡Plot twist!',
      cuerpo:
        efecto === 'robada'
          ? `${pareja.yo.nombre} te robó una carta con un plot twist.`
          : `${pareja.yo.nombre} te bloqueó una carta con un plot twist.`,
      url: '/dashboard',
      tag: 'carta-recibida',
      preferencia: 'carta_recibida',
    });
  } catch (e) {
    console.warn('No se pudo enviar el push de plot twist usado:', e);
  }
}

/** Marca como vista la revelación de "te usaron un plot twist encima" (solo tuya). */
export async function marcarPlotTwistVisto(
  cartaAsignadaId: string,
): Promise<ResultadoAccion> {
  const parsed = esquemaCartaId.safeParse({ cartaAsignadaId });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const usuario = await obtenerUsuarioActual();
  const supabase = crearClienteServidor();
  const { error } = await supabase
    .from('cartas_asignadas')
    .update({ notificado_en: new Date().toISOString() })
    .eq('id', parsed.data.cartaAsignadaId)
    .eq('usuario_id', usuario.id);

  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/dashboard');
  return exito();
}
