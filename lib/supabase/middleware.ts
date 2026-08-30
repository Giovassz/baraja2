// Refresco de sesión de Supabase en el middleware de Next.js
// Implementa BJ2-003 y BJ2-005
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './tipos';

// Rutas que NO requieren sesión iniciada
const RUTAS_PUBLICAS = ['/login', '/registro', '/sin-conexion'];

export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const metodosCookies: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesAEstablecer) {
      cookiesAEstablecer.forEach(({ name, value }) => {
        request.cookies.set(name, value);
      });
      respuesta = NextResponse.next({ request });
      cookiesAEstablecer.forEach(({ name, value, options }) => {
        respuesta.cookies.set(name, value, options);
      });
    },
  };

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: metodosCookies },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const esPublica = RUTAS_PUBLICAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));

  if (!user && !esPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && (ruta === '/login' || ruta === '/registro')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return respuesta;
}
