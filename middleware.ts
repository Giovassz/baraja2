// Middleware raíz: mantiene viva la sesión de Supabase y protege rutas privadas
// Implementa BJ2-005
import type { NextRequest } from 'next/server';
import { actualizarSesion } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return actualizarSesion(request);
}

export const config = {
  matcher: [
    /*
     * Todas las rutas excepto:
     * - _next/static, _next/image
     * - archivos públicos (manifest, sw, íconos, capturas) y cualquier archivo con
     *   extensión de imagen/fuente/ícono.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|avatares/|capturas/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)',
  ],
};
