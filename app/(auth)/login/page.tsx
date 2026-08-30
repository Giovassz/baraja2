// Pantalla de inicio de sesión (sección 2)
// Implementa BJ2-008
import Link from 'next/link';
import { TarjetaAuth } from '@/components/auth/TarjetaAuth';
import { FormularioLogin } from './FormularioLogin';

export const metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return (
    <TarjetaAuth>
      <h2 className="font-heading text-2xl font-bold text-morado-marca">
        Bienvenidos de nuevo
      </h2>
      <p className="mt-1 text-sm text-morado-marca/60">
        Entra a su espacio y sigan jugando.
      </p>

      <FormularioLogin />

      <div className="mt-5 border-t border-lavanda/50 pt-4 text-center text-sm text-morado-marca/70">
        ¿Aún no tienen cuenta?{' '}
        <Link href="/registro" className="font-bold text-rosa-acento hover:underline">
          Crear cuenta
        </Link>
      </div>
    </TarjetaAuth>
  );
}
