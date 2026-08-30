// Server Actions de plot twists: usar para bloquear o robar una carta
// Implementa BJ2-027, BJ2-028
'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { esquemaUsoPlotTwist } from '@/lib/validaciones/juego';
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

  revalidatePath('/dashboard');
  revalidatePath('/plot-twists');
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

  revalidatePath('/dashboard');
  revalidatePath('/plot-twists');
  revalidatePath('/historial');
  return exito('Robaste esa carta. Ahora es tuya.');
}
