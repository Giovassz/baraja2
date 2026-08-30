// Route Handler: registra/borra la suscripción Web Push del usuario autenticado
// Implementa BJ2-038
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { crearClienteServidor } from '@/lib/supabase/server';
import { esquemaSuscripcionPush } from '@/lib/validaciones/notificaciones';

export async function POST(request: Request) {
  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'NO_AUTENTICADO' }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON_INVALIDO' }, { status: 400 });
  }

  const parsed = esquemaSuscripcionPush.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'DATOS_INVALIDOS' }, { status: 400 });
  }

  const { error } = await supabase.from('push_suscripciones').upsert(
    {
      usuario_id: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      user_agent: headers().get('user-agent') ?? null,
    },
    { onConflict: 'usuario_id,endpoint' },
  );

  if (error) {
    return NextResponse.json({ ok: false, error: 'ERROR_BD' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'NO_AUTENTICADO' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: 'FALTA_ENDPOINT' }, { status: 400 });
  }

  await supabase
    .from('push_suscripciones')
    .delete()
    .eq('usuario_id', user.id)
    .eq('endpoint', endpoint);

  return NextResponse.json({ ok: true });
}
