// Pantalla para pedir el link de recuperación de contraseña (sección 2)
// Implementa BJ2-008
import Link from 'next/link';
import { TarjetaAuth } from '@/components/auth/TarjetaAuth';
import { FormularioRecuperar } from './FormularioRecuperar';

export const metadata = { title: 'Recuperar contraseña' };

export default function RecuperarPage() {
  return (
    <TarjetaAuth>
      <h2 className="font-heading text-2xl font-bold text-white">¿Olvidaste tu contraseña?</h2>
      <p className="mt-1 text-sm text-white/60">
        Escribe el correo con el que se registraron y te mandamos un link para crear una
        contraseña nueva.
      </p>

      <div className="mt-6">
        <FormularioRecuperar />
      </div>

      <div className="mt-5 border-t border-white/10 pt-4 text-center text-sm text-white/70">
        <Link href="/login" className="font-bold text-rosa-acento hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </TarjetaAuth>
  );
}
