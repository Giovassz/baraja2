// Barra superior de la landing: transparente sobre el hero, sólida al hacer scroll
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';

export function NavLanding({ autenticado }: { autenticado: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const alScroll = () => setScrolled(window.scrollY > 20);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  return (
    <header className="nav-landing" data-scrolled={scrolled}>
      <div className="lp flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <LogoBaraja2 tamano={28} />
          <span className="font-heading text-[1.05rem] font-extrabold text-white">Baraja2</span>
        </Link>
        {autenticado ? (
          <Link href="/dashboard" className="cta-grande !py-2 !text-[0.85rem]">
            Entrar
          </Link>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-bold text-white/80 transition hover:text-white sm:px-4"
            >
              Entrar
            </Link>
            <Link href="/registro" className="cta-grande !py-2 !text-[0.85rem]">
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
