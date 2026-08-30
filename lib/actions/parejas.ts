// Server Actions del onboarding: crear espacio, unirse con código, avatar
// Implementa BJ2-009, BJ2-010, BJ2-011, BJ2-012, BJ2-013
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerUsuarioActual, obtenerParejaActual } from '@/lib/datos';
import {
  esquemaModalidad,
  esquemaCodigoInvitacion,
  esquemaAvatar,
  esquemaNombreEspacio,
} from '@/lib/validaciones/parejas';
import { fallo, codigoDesdeError, type ResultadoAccion } from './_resultado';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos

function generarCodigo(largo = 6): string {
  let s = '';
  for (let i = 0; i < largo; i++) {
    s += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return s;
}

/** Crea el espacio de pareja (modalidad + nombre). El creador es usuario_1. */
export async function crearEspacio(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const modalidad = esquemaModalidad.safeParse({ modalidad: formData.get('modalidad') });
  const nombre = esquemaNombreEspacio.safeParse({
    nombreEspacio: formData.get('nombreEspacio'),
  });

  if (!modalidad.success) return fallo('DATOS_INVALIDOS', modalidad.error.issues[0]?.message);
  if (!nombre.success) return fallo('DATOS_INVALIDOS', nombre.error.issues[0]?.message);

  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();

  if (usuario.pareja_id) {
    return fallo('YA_TIENES_PAREJA');
  }

  // Reintenta ante una colisión de código (unique).
  let codigo = generarCodigo();
  let parejaId: string | null = null;
  for (let intento = 0; intento < 5; intento++) {
    const { data, error } = await supabase
      .from('parejas')
      .insert({
        modalidad: modalidad.data.modalidad,
        nombre_espacio: nombre.data.nombreEspacio,
        codigo_invitacion: codigo,
        usuario_1_id: usuario.id,
      })
      .select('id')
      .single();

    if (!error && data) {
      parejaId = data.id;
      break;
    }
    if (error && error.code === '23505') {
      codigo = generarCodigo();
      continue;
    }
    return fallo(codigoDesdeError(error), 'No pudimos crear el espacio.');
  }

  if (!parejaId) return fallo('ERROR_INESPERADO', 'No pudimos crear el espacio.');

  await supabase.from('usuarios').update({ pareja_id: parejaId }).eq('id', usuario.id);

  revalidatePath('/', 'layout');
  redirect('/avatar');
}

/** El segundo jugador se une usando el código de invitación (RPC transaccional). */
export async function unirseConCodigo(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaCodigoInvitacion.safeParse({ codigo: formData.get('codigo') });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('vincular_con_codigo', {
    p_codigo: parsed.data.codigo,
  });

  if (error) {
    return fallo(codigoDesdeError(error));
  }

  revalidatePath('/', 'layout');
  redirect('/avatar');
}

/** Guarda el avatar elegido y avanza al dashboard (o a la espera del código). */
export async function guardarAvatar(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaAvatar.safeParse({ avatarId: formData.get('avatarId') });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();

  const { error } = await supabase
    .from('usuarios')
    .update({ avatar_id: parsed.data.avatarId })
    .eq('id', usuario.id);

  if (error) return fallo(codigoDesdeError(error), 'No pudimos guardar tu avatar.');

  revalidatePath('/', 'layout');

  const pareja = await obtenerParejaActual();
  if (pareja && !pareja.usuario_2_id) {
    redirect('/vincular?esperando=1');
  }
  redirect('/dashboard');
}

/** Renombra el espacio compartido desde ajustes. */
export async function renombrarEspacio(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaNombreEspacio.safeParse({
    nombreEspacio: formData.get('nombreEspacio'),
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const supabase = crearClienteServidor();
  const pareja = await obtenerParejaActual();
  if (!pareja) return fallo('SIN_PAREJA');

  const { error } = await supabase
    .from('parejas')
    .update({ nombre_espacio: parsed.data.nombreEspacio })
    .eq('id', pareja.id);

  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/', 'layout');
  return { ok: true, mensaje: 'Nombre actualizado.' };
}
