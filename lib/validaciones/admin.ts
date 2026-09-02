// Esquema zod para las acciones del panel oculto /admin
import { z } from 'zod';

export const esquemaAlternarTester = z.object({
  usuarioId: z.string().uuid('Identificador no válido.'),
  activo: z.boolean(),
});
export type DatosAlternarTester = z.infer<typeof esquemaAlternarTester>;

export const esquemaAlternarCuentaActiva = z.object({
  usuarioId: z.string().uuid('Identificador no válido.'),
  activo: z.boolean(),
});
export type DatosAlternarCuentaActiva = z.infer<typeof esquemaAlternarCuentaActiva>;

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

export const esquemaEditarCartaCatalogo = z.object({
  id: z.string().uuid('Identificador no válido.'),
  texto: z.string().trim().min(1, 'El texto no puede estar vacío.'),
  tipo: z.enum(['estandar', 'spicy'], { errorMap: () => ({ message: 'Elige un tipo.' }) }),
  modalidad: z.enum(['distancia', 'hibrida', 'fisica', 'todas'], {
    errorMap: () => ({ message: 'Elige una modalidad.' }),
  }),
  puntos: z.coerce.number().int().min(1, 'Mínimo 1 punto.').max(10, 'Máximo 10 puntos.'),
});

export const esquemaEditarUsuario = z.object({
  id: z.string().uuid('Identificador no válido.'),
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre no puede estar vacío.')
    .max(40, 'Máximo 40 caracteres.'),
});

export const esquemaEliminarUsuario = z.object({
  id: z.string().uuid('Identificador no válido.'),
});

export const esquemaAgregarPlotTwists = z.object({
  tipo: z.enum(['estandar', 'spicy'], { errorMap: () => ({ message: 'Elige un tipo.' }) }),
  modalidad: z.enum(['distancia', 'hibrida', 'fisica'], {
    errorMap: () => ({ message: 'Elige una modalidad.' }),
  }),
  efecto: z.enum(['bloquear_carta', 'robar_carta', 'otro'], {
    errorMap: () => ({ message: 'Elige un efecto.' }),
  }),
  // Una línea por plot twist, formato "Nombre: Descripción".
  lineas: z.string().min(1, 'Escribe al menos un plot twist, uno por línea.'),
});
export type DatosAgregarPlotTwists = z.infer<typeof esquemaAgregarPlotTwists>;

export const esquemaEditarPlotTwist = z.object({
  id: z.string().uuid('Identificador no válido.'),
  nombre: z.string().trim().min(1, 'El nombre no puede estar vacío.').max(60, 'Máximo 60 caracteres.'),
  descripcion: z.string().trim().min(1, 'La descripción no puede estar vacía.'),
  tipo: z.enum(['estandar', 'spicy'], { errorMap: () => ({ message: 'Elige un tipo.' }) }),
  modalidad: z.enum(['distancia', 'hibrida', 'fisica'], {
    errorMap: () => ({ message: 'Elige una modalidad.' }),
  }),
  efecto: z.enum(['bloquear_carta', 'robar_carta', 'otro'], {
    errorMap: () => ({ message: 'Elige un efecto.' }),
  }),
});
export type DatosEditarPlotTwist = z.infer<typeof esquemaEditarPlotTwist>;

export const esquemaDesactivarPlotTwist = z.object({
  id: z.string().uuid('Identificador no válido.'),
});
