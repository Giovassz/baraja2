// Pantalla de registro (sección 2). Verificación de mayoría de edad: checkbox simple (supuesto S6).
// Implementa BJ2-008
import Link from 'next/link';
import { FormularioRegistro } from './FormularioRegistro';

export const metadata = { title: 'Crear cuenta' };

export default function RegistroPage() {
  return (
    <section className="widget">
      <h2 className="text-2xl">Crear cuenta</h2>
      <p className="mt-1 text-sm text-morado-marca/70">
        Cada quien crea su propia cuenta y después vinculan su espacio.
      </p>
      <FormularioRegistro />
      <p className="mt-4 text-center text-sm text-morado-marca/70">
        ¿Ya tienen cuenta?{' '}
        <Link href="/login" className="font-semibold text-rosa-acento">
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
