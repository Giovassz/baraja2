// Esquemas zod para Web Push y preferencias de notificación
// Implementa BJ2-038, BJ2-040
import { z } from 'zod';

export const esquemaSuscripcionPush = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
export type DatosSuscripcionPush = z.infer<typeof esquemaSuscripcionPush>;

export const esquemaPreferenciasNotificacion = z.object({
  reset_semanal: z.boolean(),
  carta_recibida: z.boolean(),
});
export type DatosPreferenciasNotificacion = z.infer<typeof esquemaPreferenciasNotificacion>;
