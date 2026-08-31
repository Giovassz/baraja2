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

/** Paso 1: el receptor avisa "ya lo hice". Todavía no otorga el punto. */
export async function reclamarCumplida(
  cartaAsignadaId: string,
): Promise<ResultadoAccion> {
  const parsed = esquemaCartaId.safeParse({ cartaAsignadaId });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('reclamar_cumplida', {
    p_carta_asignada_id: parsed.data.cartaAsignadaId,
  });
  if (error) return fallo(codigoDesdeError(error));

  // Aviso push a quien mandó la carta: le toca confirmar (best-effort).
  try {
    const pareja = await obtenerParejaActual();
    if (pareja?.companero) {
      await enviarPushAUsuario(pareja.companero.id, {
        titulo: 'Te dicen que ya lo hizo',
        cuerpo: `${pareja.yo.nombre} avisó que ya cumplió tu reto. Confírmalo para darle el punto.`,
        url: '/dashboard',
        tag: 'carta-recibida',
        preferencia: 'carta_recibida',
      });
    }
  } catch (e) {
    console.warn('No se pudo enviar el push de "ya lo hice":', e);
  }

  revalidatePath('/dashboard');
  return exito('Le avisamos a tu pareja — cuando confirme, ganas el punto.');
}

/** Paso 2: quien mandó la carta confirma; el punto es para quien la cumplió. */
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
  revalidatePath('/tienda');
  revalidatePath('/historial');
  return exito('¡Confirmado! Le dimos el punto a tu pareja.');
}

export async function recargarCartas(): Promise<ResultadoAccion> {
  const supabase = crearClienteServidor();
  const { data, error } = await supabase.rpc('recargar_cartas');
  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/dashboard');
  return exito(`Recargaste ${data ?? 0} carta(s).`);
}

/**
 * Solo para cuentas con modo_tester activo (desde la Tienda): reload normal solo
 * puede cambiar cartas disponibles, así que si ya cumpliste las 5 no sirve de nada.
 * Esto te da una mano nueva completa sin esperar los 7 días.
 */
export async function repartirBarajaTester(): Promise<ResultadoAccion> {
  const supabase = crearClienteServidor();
  const { data, error } = await supabase.rpc('repartir_baraja_tester');
  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/dashboard');
  revalidatePath('/tienda');
  return exito(`Nueva baraja lista: ${data ?? 0} carta(s) fresca(s).`);
}
