// Pantalla de registro (sección 2). Verificación de mayoría de edad: checkbox simple (supuesto S6).
// Implementa BJ2-008
import Link from 'next/link';
import { TarjetaAuth } from '@/components/auth/TarjetaAuth';
import { FormularioRegistro } from './FormularioRegistro';

export const metadata = { title: 'Crear cuenta' };

export default function RegistroPage() {
  return (
    <TarjetaAuth>
      <h2 className="font-heading text-2xl font-bold text-morado-marca">Creen su cuenta</h2>
      <p className="mt-1 text-sm text-morado-marca/60">
        Cada quien crea la suya y después vinculan su espacio.
      </p>

      <FormularioRegistro />

      <div className="mt-5 border-t border-lavanda/50 pt-4 text-center text-sm text-morado-marca/70">
        ¿Ya tienen cuenta?{' '}
        <Link href="/login" className="font-bold text-rosa-acento hover:underline">
          Inicia sesión
        </Link>
      </div>
    </TarjetaAuth>
  );
}
