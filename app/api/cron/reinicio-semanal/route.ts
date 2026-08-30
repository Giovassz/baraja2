// Route Handler del cron diario de reinicio semanal (sección 4.1)
// Lo invoca Vercel Cron (vercel.json) o una Supabase Scheduled Function, una vez al día,
// con el header Authorization: Bearer <CRON_SECRET>.
// Implementa BJ2-016, BJ2-039
import { NextResponse } from 'next/server';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { enviarPushAUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function autorizado(request: Request): boolean {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  const header = request.headers.get('authorization');
  return header === `Bearer ${secreto}`;
}

async function ejecutar(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ ok: false, error: 'NO_AUTORIZADO' }, { status: 401 });
  }

  const supabase = crearClienteAdmin();

  // Anota qué notificaciones de reset existían antes, para enviar push solo de las nuevas.
  const desde = new Date().toISOString();

  const { data: procesadas, error } = await supabase.rpc('reiniciar_ciclos_semanales');
  if (error) {
    console.error('Error en reiniciar_ciclos_semanales:', error);
    return NextResponse.json({ ok: false, error: 'ERROR_REINICIO' }, { status: 500 });
  }

  // Envía push por cada notificación reset_semanal recién creada.
  const { data: nuevas } = await supabase
    .from('notificaciones')
    .select('usuario_id, payload')
    .eq('tipo', 'reset_semanal')
    .gte('created_at', desde);

  let pushEnviados = 0;
  for (const n of nuevas ?? []) {
    pushEnviados += await enviarPushAUsuario(n.usuario_id, {
      titulo: '🃏 Nueva semana en Baraja2',
      cuerpo: 'Ya tienes 5 cartas nuevas. Ábrelas y juega con tu pareja.',
      url: '/dashboard',
      tag: 'reset-semanal',
      preferencia: 'reset_semanal',
    });
  }

  return NextResponse.json({
    ok: true,
    parejasProcesadas: procesadas ?? 0,
    pushEnviados,
  });
}

export async function GET(request: Request) {
  return ejecutar(request);
}

export async function POST(request: Request) {
  return ejecutar(request);
}
