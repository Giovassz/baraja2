// Último paso del onboarding: ofrecer activar notificaciones antes de entrar a Casa
// por primera vez (antes solo se encontraba escarbando en Perfil → Notificaciones).
// Implementa BJ2-038
import Link from 'next/link';
import { Icono } from '@/components/ui/iconos';
import { PanelNotificaciones } from '@/app/(app)/ajustes/notificaciones/PanelNotificaciones';

export const metadata = { title: 'Notificaciones' };

export default function NotificacionesOnboardingPage() {
  const vapidPublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

  return (
    <section className="widget flex flex-col gap-4">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rosa-acento/15 text-rosa-acento">
          <Icono.campana className="h-6 w-6" strokeWidth={2.5} />
        </span>
        <h2 className="mt-3 text-2xl">Activa las notificaciones</h2>
        <p className="mt-1 text-sm text-white/70">
          Así te enteras al momento cuando tu pareja te juega una carta o te confirma
          un punto — no tienes que estar abriendo la app a cada rato.
        </p>
      </div>

      <PanelNotificaciones
        vapidPublica={vapidPublica}
        preferencias={{ reset_semanal: true, carta_recibida: true }}
      />

      <Link href="/dashboard" className="boton-primario w-full text-center">
        Continuar a Casa
        <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
      </Link>
    </section>
  );
}
