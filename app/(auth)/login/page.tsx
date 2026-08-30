// Pantalla de inicio de sesión (sección 2)
// Implementa BJ2-008
import Link from 'next/link';
import { FormularioLogin } from './FormularioLogin';

export const metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return (
    <section className="widget">
      <h2 className="text-2xl">Iniciar sesión</h2>
      <FormularioLogin />
      <p className="mt-4 text-center text-sm text-morado-marca/70">
        ¿Aún no tienen cuenta?{' '}
        <Link href="/registro" className="font-semibold text-rosa-acento">
          Crear cuenta
        </Link>
      </p>
    </section>
  );
}
