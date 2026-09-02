// Navegación del panel admin: barra lateral en pantallas anchas, pestañas
// horizontales con scroll en el celular.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

const ITEMS: { href: string; etiqueta: string; icono: LucideIcon }[] = [
  { href: '/admin', etiqueta: 'Resumen', icono: Icono.estrella },
  { href: '/admin/usuarios', etiqueta: 'Usuarios', icono: Icono.usuario },
  { href: '/admin/cartas', etiqueta: 'Cartas', icono: Icono.mano },
];

export function SidebarAdmin() {
  const ruta = usePathname();

  return (
    <nav
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-3
        sm:w-52 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:border-white/10 sm:pt-6"
    >
      <div className="mb-1 hidden items-center gap-2 px-2 sm:flex">
        <span className="rounded-full bg-rosa-acento/15 p-2 text-rosa-acento">
          <Icono.escudo className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="font-heading text-sm text-white/70">Admin</span>
      </div>

      {ITEMS.map((item) => {
        const activo = ruta === item.href;
        const Ico = item.icono;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition sm:rounded-widget ${
              activo
                ? 'bg-rosa-acento/20 text-rosa-acento'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Ico className="h-4 w-4" strokeWidth={2.5} />
            {item.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
