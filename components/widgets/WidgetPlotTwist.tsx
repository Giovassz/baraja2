// Widget de plot twist desbloqueado (sección 5): usar para bloquear o robar una carta
// Implementa BJ2-025, BJ2-027, BJ2-028, BJ2-029
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useCelebracion } from '@/components/ui/Celebracion';
import { usarPlotTwistBloquear, usarPlotTwistRobar } from '@/lib/actions/plot-twists';

export interface CartaObjetivo {
  id: string;
  texto: string;
}

interface WidgetPlotTwistProps {
  id: string;
  nombre: string;
  descripcion: string;
  efecto: 'bloquear_carta' | 'robar_carta' | 'otro';
  usado: boolean;
  objetivos: CartaObjetivo[];
}

export function WidgetPlotTwist({
  id,
  nombre,
  descripcion,
  efecto,
  usado,
  objetivos,
}: WidgetPlotTwistProps) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const { celebrar, Corazones } = useCelebracion();

  const esRobar = efecto === 'robar_carta';
  const accionable = efecto === 'robar_carta' || efecto === 'bloquear_carta';

  function usar(cartaObjetivoId: string) {
    setError(null);
    iniciar(async () => {
      const r = esRobar
        ? await usarPlotTwistRobar(id, cartaObjetivoId)
        : await usarPlotTwistBloquear(id, cartaObjetivoId);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo usar el plot twist.');
        return;
      }
      setAbierto(false);
      celebrar();
      router.refresh();
    });
  }

  return (
    <article
      className={`widget flex flex-col justify-between bg-gradient-to-br from-rosa-acento/20 to-blanco-calido ${
        usado ? 'opacity-60' : ''
      }`}
    >
      <Corazones />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          <h3 className="text-lg">{nombre}</h3>
        </div>
        <p className="mt-1 text-sm text-morado-marca/70">{descripcion}</p>
      </div>

      <button
        className="boton-primario mt-3 w-full py-2 text-sm"
        disabled={usado || !accionable || objetivos.length === 0}
        onClick={() => setAbierto(true)}
      >
        {usado
          ? 'Ya usado'
          : !accionable
            ? 'Efecto especial'
            : objetivos.length === 0
              ? 'Sin cartas objetivo'
              : esRobar
                ? 'Robar una carta'
                : 'Bloquear una carta'}
      </button>

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={esRobar ? 'Elige la carta a robar' : 'Elige la carta a bloquear'}
      >
        <div className="flex flex-col gap-2">
          {objetivos.map((o) => (
            <button
              key={o.id}
              disabled={pendiente}
              onClick={() => usar(o.id)}
              className="rounded-widget border-2 border-lavanda/50 bg-white/70 p-3 text-left text-sm text-morado-marca transition hover:border-rosa-acento disabled:opacity-50"
            >
              {o.texto}
            </button>
          ))}
          {error && <p className="text-xs text-vino-marca">{error}</p>}
        </div>
      </Modal>
    </article>
  );
}
