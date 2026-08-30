// Botón "Instalar app": usa beforeinstallprompt (Android y escritorio Chrome/Edge) y da
// instrucciones para iOS y para navegadores sin soporte. Baraja2 se instala desde la web.
// Implementa BJ2-006
'use client';

import { useEffect, useState } from 'react';
import { Icono } from '@/components/ui/iconos';

interface PromptInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Plataforma = 'android' | 'ios' | 'escritorio' | 'otro';

export function BotonInstalar({ className = '' }: { className?: string }) {
  const [prompt, setPrompt] = useState<PromptInstalacion | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [plataforma, setPlataforma] = useState<Plataforma>('otro');
  const [ayudaAbierta, setAyudaAbierta] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const yaInstalada =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalada(yaInstalada);

    const ua = window.navigator.userAgent;
    const esIos = /iphone|ipad|ipod/i.test(ua);
    const esAndroid = /android/i.test(ua);
    const tocable = window.matchMedia('(pointer: coarse)').matches;
    setPlataforma(
      esIos ? 'ios' : esAndroid ? 'android' : tocable ? 'otro' : 'escritorio',
    );

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
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
      return;
    }
    setAyudaAbierta((v) => !v);
  }

  const etiqueta =
    plataforma === 'ios'
      ? 'Cómo instalarla en iPhone'
      : plataforma === 'escritorio'
        ? 'Instalar Baraja2'
        : 'Instalar en tu teléfono';

  return (
    <div className={className}>
      <button onClick={instalar} className="cta-fantasma">
        <Icono.bolsa className="h-4 w-4" strokeWidth={2.5} />
        {etiqueta}
      </button>

      {(ayudaAbierta || (plataforma === 'ios' && !prompt)) && (
        <div className="mt-3 max-w-xs rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-white/75">
          {plataforma === 'ios' ? (
            <p>
              En iPhone, abre esta página en <span className="font-bold text-white">Safari</span>,
              toca <span className="font-bold text-white">Compartir</span>{' '}
              <Icono.compartir className="inline h-4 w-4" strokeWidth={2.5} /> y luego{' '}
              <span className="font-bold text-white">Añadir a pantalla de inicio</span>.
            </p>
          ) : plataforma === 'escritorio' ? (
            <p>
              En Chrome o Edge, haz clic en el ícono de{' '}
              <span className="font-bold text-white">instalar</span> de la barra de
              direcciones, o menú <span className="font-bold text-white">⋮ → Instalar Baraja2</span>.
              También funciona perfecto en el navegador.
            </p>
          ) : (
            <p>
              Abre el menú de tu navegador y elige{' '}
              <span className="font-bold text-white">Instalar app</span> o{' '}
              <span className="font-bold text-white">Añadir a pantalla de inicio</span>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
