// Refresco de sesión de Supabase en el middleware de Next.js
// Implementa BJ2-003 y BJ2-005
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './tipos';

// Rutas que NO requieren sesión iniciada
const RUTAS_PUBLICAS = ['/login', '/registro', '/recuperar', '/sin-conexion', '/auth'];
// Rutas públicas de coincidencia exacta (la landing)
const RUTAS_PUBLICAS_EXACTAS = ['/'];

export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin configuración de Supabase el middleware no puede validar sesión: deja pasar
  // en vez de tumbar todo el sitio con un 500.
  if (!url || !anon) {
    console.warn(
      'Middleware: faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
    return respuesta;
  }

  try {
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

    const supabase = createServerClient<Database>(url, anon, { cookies: metodosCookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const ruta = request.nextUrl.pathname;
    const esPublica =
      RUTAS_PUBLICAS_EXACTAS.includes(ruta) ||
      RUTAS_PUBLICAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));

    if (!user && !esPublica) {
      const destino = request.nextUrl.clone();
      destino.pathname = '/login';
      return NextResponse.redirect(destino);
    }

    if (user && (ruta === '/login' || ruta === '/registro')) {
      const destino = request.nextUrl.clone();
      destino.pathname = '/dashboard';
      return NextResponse.redirect(destino);
    }

    return respuesta;
  } catch (error) {
    console.error('Middleware: error al refrescar la sesión de Supabase:', error);
    return respuesta;
  }
}
