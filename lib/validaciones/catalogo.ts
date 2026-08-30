// Esquema zod ESTRICTO del archivo seed/catalogo.json (sección 4.6).
// El script scripts/importar-catalogo.ts falla con mensaje claro si el archivo no cumple.
// Implementa BJ2-041
import { z } from 'zod';

export const esquemaCartaCatalogo = z
  .object({
    texto: z.string().trim().min(1, 'El texto de la carta no puede estar vacío.'),
    tipo: z.enum(['estandar', 'spicy']),
    modalidad: z.enum(['distancia', 'hibrida', 'fisica', 'todas']),
    puntos_otorgados: z.number().int().min(0).default(1),
  })
  .strict();

export const esquemaPlotTwistCatalogo = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre del plot twist no puede estar vacío.'),
    descripcion: z.string().trim().min(1, 'La descripción del plot twist no puede estar vacía.'),
    efecto: z.enum(['bloquear_carta', 'robar_carta', 'otro']),
    modalidad: z.enum(['distancia', 'hibrida', 'fisica']),
    tipo: z.enum(['estandar', 'spicy']),
  })
  .strict();

export const esquemaCatalogo = z
  .object({
    _comentario: z.string().optional(),
    cartas: z.array(esquemaCartaCatalogo).min(1, 'El catálogo debe incluir al menos una carta.'),
    plot_twists: z
      .array(esquemaPlotTwistCatalogo)
      .min(1, 'El catálogo debe incluir al menos un plot twist.'),
  })
  .strict();

export type Catalogo = z.infer<typeof esquemaCatalogo>;
export type CartaCatalogo = z.infer<typeof esquemaCartaCatalogo>;
export type PlotTwistCatalogo = z.infer<typeof esquemaPlotTwistCatalogo>;
