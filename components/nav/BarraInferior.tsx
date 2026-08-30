// Barra de navegación inferior estilo Tinder: Casa · Historial · Tienda · Perfil
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
  { href: '/perfil', etiqueta: 'Perfil', icono: Icono.usuario },
];

export function BarraInferior() {
  const ruta = usePathname();

  return (
    <nav
      className="chrome-oscuro fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-2xl items-stretch justify-around border-t px-2"
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
            <motion.span
              animate={{ scale: activo ? 1.05 : 1 }}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                activo ? 'bg-gradient-to-br from-rosa-acento to-coral text-white shadow-[0_6px_16px_-4px_rgba(232,93,138,0.7)]' : 'text-white/45'
              }`}
            >
              <Ico className="h-[18px] w-[18px]" strokeWidth={activo ? 2.6 : 2} />
            </motion.span>
            <span
              className={`text-[10px] font-bold tracking-wide transition ${
                activo ? 'text-white' : 'text-white/40'
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
