// Esquemas zod para el flujo de onboarding: modalidad, vinculación, avatar y nombre del espacio
// Implementa BJ2-009..013
import { z } from 'zod';
import { CATALOGO_AVATARES } from '@/lib/reglas/avatares';

const idsAvatar = CATALOGO_AVATARES.map((a) => a.id) as [string, ...string[]];

export const esquemaModalidad = z.object({
  modalidad: z.enum(['distancia', 'hibrida', 'fisica'], {
    errorMap: () => ({ message: 'Elige una modalidad de relación.' }),
  }),
});
export type DatosModalidad = z.infer<typeof esquemaModalidad>;

export const esquemaCodigoInvitacion = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,10}$/, 'El código tiene entre 6 y 10 letras o números.'),
});
export type DatosCodigoInvitacion = z.infer<typeof esquemaCodigoInvitacion>;

export const esquemaAvatar = z.object({
  avatarId: z.enum(idsAvatar, {
    errorMap: () => ({ message: 'Elige un avatar.' }),
  }),
});
export type DatosAvatar = z.infer<typeof esquemaAvatar>;

export const esquemaNombreEspacio = z.object({
  nombreEspacio: z
    .string()
    .trim()
    .min(2, 'Ponle un nombre a su espacio (al menos 2 letras).')
    .max(40, 'El nombre es demasiado largo.'),
});
export type DatosNombreEspacio = z.infer<typeof esquemaNombreEspacio>;
