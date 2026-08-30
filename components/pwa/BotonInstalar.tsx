// Botón "Instalar app": usa beforeinstallprompt (Android/Chrome) y da instrucciones
// para iOS. Baraja2 es una PWA — se instala desde la misma web, sin tiendas.
// Implementa BJ2-006
'use client';

import { useEffect, useState } from 'react';
import { Icono } from '@/components/ui/iconos';

interface PromptInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function BotonInstalar({ className = '' }: { className?: string }) {
  const [prompt, setPrompt] = useState<PromptInstalacion | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [ios, setIos] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const yaInstalada =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalada(yaInstalada);

    const esIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIos(esIos && !yaInstalada);

    const alPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptInstalacion);
    };
    const alInstalar = () => {
      setInstalada(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', alPrompt);
    window.addEventListener('appinstalled', alInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', alPrompt);
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, []);

  if (instalada) {
    return (
      <p className={`inline-flex items-center gap-2 text-sm font-semibold text-menta ${className}`}>
        <Icono.check className="h-4 w-4" strokeWidth={3} />
        Ya tienes Baraja2 instalada
      </p>
    );
  }

  async function instalar() {
    if (!prompt) {
      setAyudaAbierta(true);
      return;
    }
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return (
    <div className={className}>
      <button onClick={instalar} className="cta-fantasma">
        <Icono.bolsa className="h-4 w-4" strokeWidth={2.5} />
        Instalar en tu teléfono
      </button>

      {(ayudaAbierta || ios) && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-white/75">
          {ios ? (
            <p>
              En iPhone: toca{' '}
              <span className="font-bold text-white">Compartir</span>{' '}
              <Icono.compartir className="inline h-4 w-4" strokeWidth={2.5} /> y luego{' '}
              <span className="font-bold text-white">Añadir a pantalla de inicio</span>.
            </p>
          ) : (
            <p>
              En tu navegador abre el menú (⋮) y elige{' '}
              <span className="font-bold text-white">Instalar app</span> o{' '}
              <span className="font-bold text-white">Añadir a pantalla de inicio</span>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
