// Server Action del modo Spicy (sección 4.7): estado por usuario en la tabla usuarios
// Implementa BJ2-030, BJ2-031
'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerUsuarioActual, obtenerParejaActual } from '@/lib/datos';
import { esquemaModoSpicy, esquemaCartaId } from '@/lib/validaciones/juego';
import { enviarPushAUsuario } from '@/lib/push';
import { exito, fallo, codigoDesdeError, type ResultadoAccion } from './_resultado';

export async function cambiarModoSpicy(activo: boolean): Promise<ResultadoAccion> {
  const parsed = esquemaModoSpicy.safeParse({ activo });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const usuario = await obtenerUsuarioActual();

  // El modo Spicy exige confirmación de mayoría de edad (sección 4.7 / supuesto S6).
  if (parsed.data.activo && !usuario.confirmo_mayor_edad) {
    return fallo('MENOR_DE_EDAD');
  }

  const supabase = crearClienteServidor();
  const { error } = await supabase
    .from('usuarios')
    .update({ modo_spicy_activo: parsed.data.activo })
    .eq('id', usuario.id);

  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/dashboard');
  revalidatePath('/spicy');
  return exito(
    parsed.data.activo ? 'Modo Spicy activado.' : 'Modo Spicy desactivado.',
  );
}

/** Juega una carta Spicy del catálogo (fuera del ciclo de 5, supuesto S3). */
export async function jugarCartaSpicy(catalogoCartaId: string): Promise<ResultadoAccion> {
  const parsed = esquemaCartaId.safeParse({ cartaAsignadaId: catalogoCartaId });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('jugar_carta_spicy', {
    p_catalogo_carta_id: parsed.data.cartaAsignadaId,
  });
  if (error) return fallo(codigoDesdeError(error));

  try {
    const pareja = await obtenerParejaActual();
    if (pareja?.companero) {
      await enviarPushAUsuario(pareja.companero.id, {
        titulo: 'Carta Spicy',
        cuerpo: `${pareja.yo.nombre} te jugó una carta Spicy.`,
        url: '/dashboard',
        tag: 'carta-recibida',
        preferencia: 'carta_recibida',
      });
    }
  } catch (e) {
    console.warn('No se pudo enviar el push de carta spicy:', e);
  }

  revalidatePath('/dashboard');
  revalidatePath('/spicy');
  revalidatePath('/historial');
  return exito('Carta Spicy jugada. Le avisamos a tu pareja.');
}
