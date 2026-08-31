// Pantalla de inicio de sesión (sección 2)
// Implementa BJ2-008
import Link from 'next/link';
import { TarjetaAuth } from '@/components/auth/TarjetaAuth';
import { FormularioLogin } from './FormularioLogin';

export const metadata = { title: 'Iniciar sesión' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <TarjetaAuth>
      <h2 className="font-heading text-2xl font-bold text-white">Bienvenidos de nuevo</h2>
      <p className="mt-1 text-sm text-white/60">Entra a su espacio y sigan jugando.</p>

      {searchParams.error === 'oauth' && (
        <p className="mt-4 rounded-2xl bg-rosa-acento/15 px-3.5 py-2.5 text-sm font-semibold text-rosa-acento">
          No se pudo entrar con ese proveedor. Inténtalo de nuevo.
        </p>
      )}

      <div className="mt-6">
        <FormularioLogin />
      </div>

      <div className="mt-5 border-t border-white/10 pt-4 text-center text-sm text-white/70">
        ¿Aún no tienen cuenta?{' '}
        <Link href="/registro" className="font-bold text-rosa-acento hover:underline">
          Crear cuenta
        </Link>
      </div>
    </TarjetaAuth>
  );
}
