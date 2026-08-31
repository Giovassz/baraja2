// Continuar con Google / Discord (OAuth de Supabase). Redirige al proveedor y vuelve a /auth/callback.
// Implementa BJ2-008
'use client';

import { useState } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/browser';

function IconoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function IconoDiscord() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#5865F2" aria-hidden>
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.85-.588 1.234a18.27 18.27 0 0 0-5.94 0A12.6 12.6 0 0 0 9.44 3 19.74 19.74 0 0 0 5.68 4.37C1.9 9.98.876 15.45 1.42 20.84a19.9 19.9 0 0 0 5.99 3.03c.484-.66.915-1.36 1.286-2.096a12.9 12.9 0 0 1-2.02-.973c.169-.124.335-.253.494-.386a14.2 14.2 0 0 0 12.08 0c.16.14.326.269.494.386-.647.383-1.33.71-2.024.974.372.735.802 1.435 1.286 2.095a19.86 19.86 0 0 0 5.992-3.03c.646-6.24-1.078-11.66-4.578-16.472ZM8.02 17.573c-1.183 0-2.157-1.09-2.157-2.42 0-1.33.955-2.42 2.157-2.42s2.176 1.09 2.157 2.42c0 1.33-.955 2.42-2.157 2.42Zm7.96 0c-1.183 0-2.157-1.09-2.157-2.42 0-1.33.955-2.42 2.157-2.42s2.176 1.09 2.157 2.42c0 1.33-.955 2.42-2.157 2.42Z" />
    </svg>
  );
}

export function BotonesSociales({ deshabilitado = false }: { deshabilitado?: boolean }) {
  const [cargando, setCargando] = useState<'google' | 'discord' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function entrar(provider: 'google' | 'discord') {
    if (deshabilitado) return;
    setError(null);
    setCargando(provider);
    const supabase = crearClienteNavegador();
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (e) {
      setCargando(null);
      setError('No se pudo continuar. Revisa que el proveedor esté configurado.');
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => entrar('google')}
        disabled={deshabilitado || cargando !== null}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] font-heading text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-40"
      >
        {cargando === 'google' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <IconoGoogle />
        )}
        Continuar con Google
      </button>

      <button
        type="button"
        onClick={() => entrar('discord')}
        disabled={deshabilitado || cargando !== null}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] font-heading text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-40"
      >
        {cargando === 'discord' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <IconoDiscord />
        )}
        Continuar con Discord
      </button>

      {error && <p className="text-center text-xs text-rosa-acento">{error}</p>}
    </div>
  );
}
