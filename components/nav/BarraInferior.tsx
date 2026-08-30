// Barra de navegación inferior (mobile-first): Casa · Historial · Tienda · Perfil
// Implementa BJ2-014
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

const TABS: { href: string; etiqueta: string; icono: LucideIcon }[] = [
  { href: '/dashboard', etiqueta: 'Casa', icono: Icono.casa },
  { href: '/historial', etiqueta: 'Historial', icono: Icono.reloj },
  { href: '/tienda', etiqueta: 'Tienda', icono: Icono.tienda },
  { href: '/perfil', etiqueta: 'Perfil', icono: Icono.ajustes },
];

export function BarraInferior() {
  const ruta = usePathname();

  return (
    <nav
      className="chrome-oscuro fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-2xl items-stretch justify-around border-t px-2 shadow-nav"
      style={{
        height: 'calc(var(--nav-alto) + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((t) => {
        const activo = ruta === t.href || ruta.startsWith(`${t.href}/`);
        const Ico = t.icono;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-1"
          >
            {activo && (
              <motion.span
                layoutId="tab-activa"
                className="absolute -top-px h-1 w-8 rounded-full bg-rosa-acento"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Ico
              className={`h-5 w-5 transition ${activo ? 'text-white' : 'text-white/55'}`}
              strokeWidth={activo ? 2.6 : 2}
            />
            <span
              className={`text-[10px] font-semibold transition ${
                activo ? 'text-white' : 'text-white/55'
              }`}
            >
              {t.etiqueta}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
