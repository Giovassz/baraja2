// Esquemas zod para registro e inicio de sesión
// Implementa BJ2-008
import { z } from 'zod';

export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'Escribe tu nombre (al menos 2 letras).')
      .max(40, 'El nombre es demasiado largo.'),
    email: z.string().trim().email('Correo no válido.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(72, 'La contraseña es demasiado larga.'),
    confirmoMayorEdad: z.boolean(),
  })
  .refine((d) => d.confirmoMayorEdad === true, {
    message: 'Debes confirmar que eres mayor de edad para usar Baraja2.',
    path: ['confirmoMayorEdad'],
  });

export type DatosRegistro = z.infer<typeof esquemaRegistro>;

export const esquemaLogin = z.object({
  email: z.string().trim().email('Correo no válido.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;
