// Esquema zod para las acciones del panel oculto /admin
import { z } from 'zod';

export const esquemaAlternarTester = z.object({
  usuarioId: z.string().uuid('Identificador no válido.'),
  activo: z.boolean(),
});
export type DatosAlternarTester = z.infer<typeof esquemaAlternarTester>;

export const esquemaAgregarCartasCatalogo = z.object({
  tipo: z.enum(['estandar', 'spicy'], { errorMap: () => ({ message: 'Elige un tipo.' }) }),
  modalidad: z.enum(['distancia', 'hibrida', 'fisica', 'todas'], {
    errorMap: () => ({ message: 'Elige una modalidad.' }),
  }),
  puntos: z.coerce.number().int().min(1, 'Mínimo 1 punto.').max(10, 'Máximo 10 puntos.'),
  lineas: z.string().min(1, 'Escribe al menos una carta, una por línea.'),
});
export type DatosAgregarCartasCatalogo = z.infer<typeof esquemaAgregarCartasCatalogo>;

export const esquemaDesactivarCartaCatalogo = z.object({
  id: z.string().uuid('Identificador no válido.'),
});
