// Esquemas zod para las mutaciones de juego: cartas y plot twists
// Implementa BJ2-018, BJ2-020, BJ2-027, BJ2-028, BJ2-035
import { z } from 'zod';

const uuid = z.string().uuid('Identificador no válido.');

export const esquemaCartaId = z.object({ cartaAsignadaId: uuid });
export type DatosCartaId = z.infer<typeof esquemaCartaId>;

export const esquemaUsoPlotTwist = z.object({
  plotTwistDesbloqueadoId: uuid,
  cartaObjetivoId: uuid,
});
export type DatosUsoPlotTwist = z.infer<typeof esquemaUsoPlotTwist>;

export const esquemaModoSpicy = z.object({
  activo: z.boolean(),
});
export type DatosModoSpicy = z.infer<typeof esquemaModoSpicy>;
