// Callback de OAuth (Google / Discord) y de links de correo (recuperar contraseña):
// intercambia el código por una sesión y manda a `next` o, si no viene, al
// enrutador post-login.
// Implementa BJ2-008
import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');
  // Solo permitimos rutas internas (evita un redirect abierto vía ?next=).
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
    ? nextParam
    : null;
  const errorDescripcion = searchParams.get('error_description');

  if (errorDescripcion) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  if (code) {
    const supabase = crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=oauth`);
    }
  }

  return NextResponse.redirect(`${origin}${next ?? '/auth/completar'}`);
}
