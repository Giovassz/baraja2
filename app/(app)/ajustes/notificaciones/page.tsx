// Ajustes de notificaciones: suscripción Web Push + preferencias por tipo (Fase 6)
// Implementa BJ2-038, BJ2-040
import Link from 'next/link';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerUsuarioActual } from '@/lib/datos';
import { PanelNotificaciones } from './PanelNotificaciones';

export const metadata = { title: 'Notificaciones' };

export default async function AjustesNotificacionesPage() {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();

  const { data: pref } = await supabase
    .from('preferencias_notificacion')
    .select('reset_semanal, carta_recibida')
    .eq('usuario_id', usuario.id)
    .maybeSingle();

  const vapidPublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

  return (
    <div className="flex flex-col gap-4">
      <Link href="/dashboard" className="text-sm font-semibold text-morado-marca/60">
        ← Volver
      </Link>
      <h1 className="text-2xl">Notificaciones</h1>

      <PanelNotificaciones
        vapidPublica={vapidPublica}
        preferencias={{
          reset_semanal: pref?.reset_semanal ?? true,
          carta_recibida: pref?.carta_recibida ?? true,
        }}
      />
    </div>
  );
}
