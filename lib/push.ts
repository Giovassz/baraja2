// Envío de Web Push vía VAPID (sección 1). Solo se ejecuta en servidor.
// Implementa BJ2-039
import 'server-only';
import webpush from 'web-push';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import type { TipoNotificacion } from '@/lib/supabase/tipos';

let configurado = false;

function configurarVapid(): boolean {
  if (configurado) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:hola@baraja2.app';
  if (!pub || !priv) {
    console.warn('Web Push desactivado: faltan las llaves VAPID en el entorno.');
    return false;
  }
  webpush.setVapidDetails(subject, pub, priv);
  configurado = true;
  return true;
}

export interface MensajePush {
  titulo: string;
  cuerpo: string;
  url?: string;
  tag?: string;
  /** Si se indica, solo se envía cuando el usuario tiene esa preferencia activa. */
  preferencia?: TipoNotificacion;
}

/**
 * Envía una notificación push a todas las suscripciones de un usuario.
 * Best-effort: nunca lanza; limpia suscripciones caducadas (404/410).
 */
export async function enviarPushAUsuario(
  usuarioId: string,
  mensaje: MensajePush,
): Promise<number> {
  if (!configurarVapid()) return 0;

  const supabase = crearClienteAdmin();

  if (mensaje.preferencia) {
    const { data: pref } = await supabase
      .from('preferencias_notificacion')
      .select('reset_semanal, carta_recibida')
      .eq('usuario_id', usuarioId)
      .maybeSingle();
    if (pref && pref[mensaje.preferencia] === false) return 0;
  }

  const { data: suscripciones } = await supabase
    .from('push_suscripciones')
    .select('*')
    .eq('usuario_id', usuarioId);

  if (!suscripciones?.length) return 0;

  const payload = JSON.stringify({
    titulo: mensaje.titulo,
    cuerpo: mensaje.cuerpo,
    url: mensaje.url ?? '/dashboard',
    tag: mensaje.tag ?? 'baraja2',
  });

  let enviadas = 0;
  await Promise.all(
    suscripciones.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        enviadas++;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from('push_suscripciones').delete().eq('id', s.id);
        } else {
          console.warn('Fallo al enviar push:', status, error);
        }
      }
    }),
  );

  return enviadas;
}
