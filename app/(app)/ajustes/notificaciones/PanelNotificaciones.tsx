// Suscripción Web Push (permiso del navegador + registro en servidor) y preferencias
// Implementa BJ2-038, BJ2-040
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { guardarPreferenciasNotificacion } from '@/lib/actions/notificaciones';
import { BotonEnviar } from '@/components/ui/Boton';

function base64UrlABytes(base64Url: string): Uint8Array {
  const relleno = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

type EstadoPush = 'cargando' | 'no-soportado' | 'sin-llave' | 'activo' | 'inactivo' | 'bloqueado';

export function PanelNotificaciones({
  vapidPublica,
  preferencias,
}: {
  vapidPublica: string;
  preferencias: { reset_semanal: boolean; carta_recibida: boolean };
}) {
  const [estado, setEstado] = useState<EstadoPush>('cargando');
  const [pendiente, iniciar] = useTransition();
  const [prefEstado, accionPref] = useFormState(guardarPreferenciasNotificacion, null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setEstado('no-soportado');
      return;
    }
    if (!vapidPublica) {
      setEstado('sin-llave');
      return;
    }
    if (Notification.permission === 'denied') {
      setEstado('bloqueado');
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstado(sub ? 'activo' : 'inactivo'))
      .catch(() => setEstado('inactivo'));
  }, [vapidPublica]);

  function activar() {
    iniciar(async () => {
      try {
        const permiso = await Notification.requestPermission();
        if (permiso !== 'granted') {
          setEstado(permiso === 'denied' ? 'bloqueado' : 'inactivo');
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlABytes(vapidPublica) as BufferSource,
        });
        const res = await fetch('/api/push/suscribir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });
        setEstado(res.ok ? 'activo' : 'inactivo');
      } catch (e) {
        console.warn('No se pudo activar el push:', e);
        setEstado('inactivo');
      }
    });
  }

  function desactivar() {
    iniciar(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch(
            `/api/push/suscribir?endpoint=${encodeURIComponent(sub.endpoint)}`,
            { method: 'DELETE' },
          );
          await sub.unsubscribe();
        }
        setEstado('inactivo');
      } catch {
        setEstado('inactivo');
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="widget bg-gradient-to-br from-lavanda to-blanco-calido">
        <h2 className="text-lg">Avisos en este dispositivo</h2>
        <p className="mt-1 text-sm text-morado-marca/70">
          Recibe una notificación cuando tu pareja te juegue una carta o cuando empiece
          una semana nueva.
        </p>

        <div className="mt-3">
          {estado === 'cargando' && (
            <p className="text-sm text-morado-marca/60">Comprobando…</p>
          )}
          {estado === 'no-soportado' && (
            <p className="text-sm text-vino-marca">
              Este navegador no soporta notificaciones push. En iPhone, instala Baraja2 en
              tu pantalla de inicio y ábrela desde ahí.
            </p>
          )}
          {estado === 'sin-llave' && (
            <p className="text-sm text-vino-marca">
              Falta configurar las llaves VAPID en el servidor.
            </p>
          )}
          {estado === 'bloqueado' && (
            <p className="text-sm text-vino-marca">
              Bloqueaste las notificaciones para Baraja2. Habilítalas desde los ajustes del
              navegador.
            </p>
          )}
          {estado === 'inactivo' && (
            <button
              className="boton-primario w-full py-2 text-sm"
              disabled={pendiente}
              onClick={activar}
            >
              {pendiente ? 'Activando…' : 'Activar notificaciones'}
            </button>
          )}
          {estado === 'activo' && (
            <button
              className="boton-secundario w-full py-2 text-sm"
              disabled={pendiente}
              onClick={desactivar}
            >
              {pendiente ? 'Desactivando…' : 'Desactivar en este dispositivo'}
            </button>
          )}
        </div>
      </section>

      <form action={accionPref} className="widget flex flex-col gap-3">
        <h2 className="text-lg">¿De qué quieres enterarte?</h2>

        <label className="flex items-center justify-between gap-3 text-sm text-morado-marca">
          Nueva semana / cartas nuevas
          <input
            type="checkbox"
            name="reset_semanal"
            defaultChecked={preferencias.reset_semanal}
            className="h-5 w-5 accent-rosa-acento"
          />
        </label>

        <label className="flex items-center justify-between gap-3 text-sm text-morado-marca">
          Mi pareja me jugó una carta
          <input
            type="checkbox"
            name="carta_recibida"
            defaultChecked={preferencias.carta_recibida}
            className="h-5 w-5 accent-rosa-acento"
          />
        </label>

        {prefEstado?.mensaje && (
          <p
            className={`text-xs ${prefEstado.ok ? 'text-morado-marca/70' : 'text-vino-marca'}`}
          >
            {prefEstado.mensaje}
          </p>
        )}

        <BotonEnviar variante="secundario" className="w-full">
          Guardar preferencias
        </BotonEnviar>
      </form>
    </div>
  );
}
