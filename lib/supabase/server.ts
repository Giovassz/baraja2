// Cliente de Supabase para componentes de servidor y Server Actions
// Implementa BJ2-003
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './tipos';

export function crearClienteServidor() {
  const almacenCookies = cookies();

  const metodosCookies: CookieMethodsServer = {
    getAll() {
      return almacenCookies.getAll();
    },
    setAll(cookiesAEstablecer) {
      try {
        cookiesAEstablecer.forEach(({ name, value, options }) => {
          almacenCookies.set(name, value, options);
        });
      } catch {
        // `setAll` desde un Server Component: lo maneja el middleware al refrescar la sesión.
      }
    },
  };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: metodosCookies },
  );
}
