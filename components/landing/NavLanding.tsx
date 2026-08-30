// Barra superior de la landing: transparente sobre el hero, sólida al hacer scroll
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';

export function NavLanding({ autenticado }: { autenticado: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const alScroll = () => setScrolled(window.scrollY > 24);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  return (
    <header className="nav-landing" data-scrolled={scrolled}>
      <div className="lp-seccion flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <LogoBaraja2 tamano={30} />
          <span className="font-heading text-lg font-extrabold text-white">Baraja2</span>
        </Link>
        {autenticado ? (
          <Link href="/dashboard" className="cta-grande !px-5 !py-2 !text-sm">
            Entrar a mi baraja
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-bold text-white/85 transition hover:text-white"
            >
              Entrar
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
