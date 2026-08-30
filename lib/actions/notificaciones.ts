// Server Actions de notificaciones: suscripción push y preferencias
// Implementa BJ2-038, BJ2-040
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerUsuarioActual } from '@/lib/datos';
import {
  esquemaSuscripcionPush,
  esquemaPreferenciasNotificacion,
} from '@/lib/validaciones/notificaciones';
import { exito, fallo, codigoDesdeError, type ResultadoAccion } from './_resultado';

export async function guardarSuscripcionPush(
  suscripcion: unknown,
): Promise<ResultadoAccion> {
  const parsed = esquemaSuscripcionPush.safeParse(suscripcion);
  if (!parsed.success) return fallo('DATOS_INVALIDOS', 'Suscripción push no válida.');

  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const ua = headers().get('user-agent') ?? null;

  const { error } = await supabase.from('push_suscripciones').upsert(
    {
      usuario_id: usuario.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      user_agent: ua,
    },
    { onConflict: 'usuario_id,endpoint' },
  );

  if (error) return fallo(codigoDesdeError(error), 'No pudimos activar las notificaciones.');
  return exito('Notificaciones activadas.');
}

export async function eliminarSuscripcionPush(endpoint: string): Promise<ResultadoAccion> {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const { error } = await supabase
    .from('push_suscripciones')
    .delete()
    .eq('usuario_id', usuario.id)
    .eq('endpoint', endpoint);
  if (error) return fallo(codigoDesdeError(error));
  return exito('Notificaciones desactivadas en este dispositivo.');
}

export async function guardarPreferenciasNotificacion(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaPreferenciasNotificacion.safeParse({
    reset_semanal: formData.get('reset_semanal') === 'on',
    carta_recibida: formData.get('carta_recibida') === 'on',
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();

  const { error } = await supabase.from('preferencias_notificacion').upsert({
    usuario_id: usuario.id,
    reset_semanal: parsed.data.reset_semanal,
    carta_recibida: parsed.data.carta_recibida,
    actualizado_en: new Date().toISOString(),
  });

  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/ajustes/notificaciones');
  return exito('Preferencias guardadas.');
}

export async function marcarNotificacionesLeidas(): Promise<ResultadoAccion> {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const { error } = await supabase
    .from('notificaciones')
    .update({ leido: true })
    .eq('usuario_id', usuario.id)
    .eq('leido', false);
  if (error) return fallo(codigoDesdeError(error));
  revalidatePath('/dashboard');
  return exito();
}
