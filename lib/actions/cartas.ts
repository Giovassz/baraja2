// Server Actions de la mecánica de cartas: jugar, confirmar cumplida, reload
// Implementa BJ2-018, BJ2-020, BJ2-034, BJ2-035, BJ2-036
'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { esquemaCartaId } from '@/lib/validaciones/juego';
import { enviarPushAUsuario } from '@/lib/push';
import { obtenerParejaActual } from '@/lib/datos';
import { exito, fallo, codigoDesdeError, type ResultadoAccion } from './_resultado';

export async function jugarCarta(cartaAsignadaId: string): Promise<ResultadoAccion> {
  const parsed = esquemaCartaId.safeParse({ cartaAsignadaId });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('jugar_carta', {
    p_carta_asignada_id: parsed.data.cartaAsignadaId,
  });
  if (error) return fallo(codigoDesdeError(error));

  // Aviso push al receptor (best-effort, no bloquea la respuesta).
  try {
    const pareja = await obtenerParejaActual();
    if (pareja?.companero) {
      await enviarPushAUsuario(pareja.companero.id, {
        titulo: 'Nueva carta',
        cuerpo: `${pareja.yo.nombre} te jugó una carta. Ábrela para verla.`,
        url: '/dashboard',
        tag: 'carta-recibida',
        preferencia: 'carta_recibida',
      });
    }
  } catch (e) {
    console.warn('No se pudo enviar el push de carta recibida:', e);
  }

  revalidatePath('/dashboard');
  revalidatePath('/historial');
  return exito('Carta jugada. Le avisamos a tu pareja.');
}

export async function confirmarCumplida(
  cartaAsignadaId: string,
): Promise<ResultadoAccion> {
  const parsed = esquemaCartaId.safeParse({ cartaAsignadaId });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('confirmar_cumplida', {
    p_carta_asignada_id: parsed.data.cartaAsignadaId,
  });
  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/dashboard');
  revalidatePath('/plot-twists');
  revalidatePath('/historial');
  return exito('¡Reto cumplido! Sumaste puntos para tu pareja.');
}

export async function recargarCartas(): Promise<ResultadoAccion> {
  const supabase = crearClienteServidor();
  const { data, error } = await supabase.rpc('recargar_cartas');
  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/dashboard');
  return exito(`Recargaste ${data ?? 0} carta(s).`);
}
