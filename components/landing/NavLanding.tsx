// Barra superior de la landing
import Link from 'next/link';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';

export function NavLanding({ autenticado }: { autenticado: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-noche/80 backdrop-blur-xl">
      <div className="lp-seccion flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoBaraja2 tamano={30} />
          <span className="font-heading text-lg font-bold text-white">Baraja2</span>
        </Link>
        {autenticado ? (
          <Link href="/dashboard" className="cta-grande !px-5 !py-2 !text-sm">
            Entrar a mi baraja
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white sm:block"
            >
              Iniciar sesión
            </Link>
            <Link href="/registro" className="cta-grande !px-5 !py-2 !text-sm">
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
