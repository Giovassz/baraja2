// Navegación del panel admin: barra lateral en pantallas anchas, pestañas
// horizontales con scroll en el celular. "Contenido" agrupa Cartas y Plot Twists,
// igual que una app de control real (referencia: ManyUnits).
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

const ITEMS: { href: string; etiqueta: string; icono: LucideIcon }[] = [
  { href: '/admin', etiqueta: 'Resumen', icono: Icono.grafico },
  { href: '/admin/usuarios', etiqueta: 'Usuarios', icono: Icono.usuario },
  { href: '/admin/espacios', etiqueta: 'Espacios', icono: Icono.corazones },
];

const CONTENIDO: { href: string; etiqueta: string; icono: LucideIcon }[] = [
  { href: '/admin/cartas', etiqueta: 'Cartas', icono: Icono.mano },
  { href: '/admin/plot-twists', etiqueta: 'Plot twists', icono: Icono.chispa },
];

export function SidebarAdmin({ email }: { email?: string }) {
  const ruta = usePathname();

  function Enlace({ item }: { item: (typeof ITEMS)[number] }) {
    const activo = ruta === item.href;
    const Ico = item.icono;
    return (
      <Link
        href={item.href}
        aria-current={activo ? 'page' : undefined}
        className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition sm:rounded-xl ${
          activo
            ? 'bg-[var(--adm-accent)]/15 text-[var(--adm-accent)]'
            : 'text-[var(--adm-text-dim)] hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]'
        }`}
      >
        <Ico className="h-4 w-4" strokeWidth={2.5} />
        {item.etiqueta}
      </Link>
    );
  }

  return (
    <nav
      className="admin-shell flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--adm-border)] bg-[var(--adm-surface)] p-3
        sm:w-56 sm:flex-col sm:justify-between sm:overflow-visible sm:border-b-0 sm:border-r sm:p-4"
    >
      <div className="flex gap-1 sm:flex-col sm:gap-1">
        <div className="mb-2 hidden items-center gap-2 px-1 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--adm-accent)]/15 text-[var(--adm-accent)]">
            <Icono.escudo className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-heading text-sm text-[var(--adm-text)]">Baraja2 Admin</span>
        </div>

        {ITEMS.slice(0, 1).map((item) => (
          <Enlace key={item.href} item={item} />
        ))}
        {ITEMS.slice(1, 2).map((item) => (
          <Enlace key={item.href} item={item} />
        ))}

        <p className="mb-1 mt-3 hidden px-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--adm-text-mute)] sm:block">
          Contenido
        </p>
        {CONTENIDO.map((item) => (
          <Enlace key={item.href} item={item} />
        ))}

        {ITEMS.slice(2).map((item) => (
          <Enlace key={item.href} item={item} />
        ))}
      </div>

      <div className="mt-4 hidden rounded-xl bg-[var(--adm-surface-2)] p-3 sm:block">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--adm-text-mute)]">
          Admin
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[var(--adm-text)]">
          {email ?? 'Cuenta admin'}
        </p>
      </div>
    </nav>
  );
}
