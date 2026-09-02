// Barra superior del panel admin: buscar usuarios, atajo a la app y menú de cuenta.
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icono } from '@/components/ui/iconos';
import { cerrarSesion } from '@/lib/actions/auth';

export function BarraSuperiorAdmin({ email }: { email: string | undefined }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = busqueda.trim();
    router.push(q ? `/admin/usuarios?q=${encodeURIComponent(q)}` : '/admin/usuarios');
  }

  const inicial = (email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-[var(--adm-border)] bg-[var(--adm-surface)] px-4 py-3 sm:px-6">
      <form onSubmit={buscar} className="hidden min-w-0 flex-1 items-center sm:flex">
        <div className="relative w-full max-w-sm">
          <Icono.buscar
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adm-text-mute)]"
            strokeWidth={2.5}
          />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar usuarios por nombre o correo…"
            className="w-full rounded-full border border-[var(--adm-border)] bg-[var(--adm-bg)] py-2 pl-9 pr-3 text-sm text-[var(--adm-text)] outline-none placeholder:text-[var(--adm-text-mute)] focus:border-[var(--adm-accent)]"
          />
        </div>
      </form>

      <h1 className="min-w-0 flex-1 truncate font-heading text-lg text-[var(--adm-text)] sm:hidden">
        Admin
      </h1>

      <Link
        href="/dashboard"
        title="Ir a la app"
        className="rounded-full p-2 text-[var(--adm-text-dim)] transition hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]"
      >
        <Icono.apps className="h-5 w-5" strokeWidth={2.2} />
      </Link>

      <button
        type="button"
        title="Notificaciones (próximamente)"
        className="rounded-full p-2 text-[var(--adm-text-dim)] transition hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]"
      >
        <Icono.campana className="h-5 w-5" strokeWidth={2.2} />
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-[var(--adm-surface-2)]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--adm-accent)] text-xs font-bold text-[var(--adm-bg)]">
            {inicial}
          </span>
          <Icono.flechaAbajo className="h-3.5 w-3.5 text-[var(--adm-text-mute)]" strokeWidth={2.5} />
        </button>

        {abierto && (
          <>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setAbierto(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] shadow-[0_20px_44px_-16px_rgba(0,0,0,0.8)]">
              <p className="truncate border-b border-[var(--adm-border)] px-4 py-3 text-xs text-[var(--adm-text-mute)]">
                {email ?? 'admin'}
              </p>
              <form action={cerrarSesion}>
                <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[var(--adm-text)] transition hover:bg-[var(--adm-surface-2)]">
                  <Icono.salir className="h-4 w-4" strokeWidth={2.5} />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
