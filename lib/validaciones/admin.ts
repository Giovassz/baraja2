// Esquema zod para las acciones del panel oculto /admin
import { z } from 'zod';

export const esquemaAlternarTester = z.object({
  usuarioId: z.string().uuid('Identificador no válido.'),
  activo: z.boolean(),
});
export type DatosAlternarTester = z.infer<typeof esquemaAlternarTester>;
