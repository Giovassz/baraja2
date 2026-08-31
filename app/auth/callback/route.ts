// Callback de OAuth (Google / Discord): intercambia el código por una sesión y
// manda al enrutador post-login.
// Implementa BJ2-008
import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
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

  return NextResponse.redirect(`${origin}/auth/completar`);
}
