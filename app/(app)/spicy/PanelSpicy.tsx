// Toggle del modo Spicy con modal de aviso de privacidad en la primera activación
// Implementa BJ2-030, BJ2-031
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { cambiarModoSpicy } from '@/lib/actions/spicy';

// Texto EXACTO del aviso (sección 4.7, no modificar).
const AVISO_PRIVACIDAD =
  'Baraja2 nunca recibe ni almacena fotos. Cualquier evidencia de un reto Spicy la comparten ustedes por fuera de la app, como prefieran.';

const CLAVE_AVISO = 'baraja2_aviso_spicy_visto';

export function PanelSpicy({
  activo,
  puedeActivar,
}: {
  activo: boolean;
  puedeActivar: boolean;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [avisoAbierto, setAvisoAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function aplicar(nuevoValor: boolean) {
    setError(null);
    iniciar(async () => {
      const r = await cambiarModoSpicy(nuevoValor);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo cambiar el modo Spicy.');
        return;
      }
      router.refresh();
    });
  }

  function alPulsar() {
    if (activo) {
      aplicar(false);
      return;
    }
    let visto = false;
    try {
      visto = localStorage.getItem(CLAVE_AVISO) === '1';
    } catch {
      /* almacenamiento no disponible */
    }
    if (visto) {
      aplicar(true);
    } else {
      setAvisoAbierto(true);
    }
  }

  function aceptarAviso() {
    try {
      localStorage.setItem(CLAVE_AVISO, '1');
    } catch {
      /* ignore */
    }
    setAvisoAbierto(false);
    aplicar(true);
  }

  if (!puedeActivar) {
    // El botón de activación no se muestra si confirmo_mayor_edad = false (criterio Fase 4).
    return (
      <p className="rounded-widget bg-rosa-acento/15 px-4 py-3 text-sm text-rosa-acento">
        El modo Spicy solo está disponible para cuentas que confirmaron ser mayores de edad.
      </p>
    );
  }

  return (
    <div className="widget widget-acento flex items-center justify-between gap-3">
      <div>
        <p className="font-heading text-lg">Modo Spicy</p>
        <p className="text-sm text-white/70">
          {activo ? 'Activo. Verás el catálogo Spicy abajo.' : 'Desactivado.'}
        </p>
        {error && <p className="mt-1 text-xs text-rosa-acento">{error}</p>}
      </div>

      <button
        role="switch"
        aria-checked={activo}
        disabled={pendiente}
        onClick={alPulsar}
        className={`relative h-8 w-14 rounded-full transition ${
          activo ? 'bg-rosa-acento' : 'bg-white/15'
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
            activo ? 'left-7' : 'left-1'
          }`}
        />
      </button>

      <Modal
        abierto={avisoAbierto}
        onCerrar={() => setAvisoAbierto(false)}
        titulo="Antes de activar el modo Spicy"
      >
        <p className="text-sm text-white">{AVISO_PRIVACIDAD}</p>
        <div className="mt-4 flex gap-2">
          <button
            className="boton-secundario flex-1 py-2 text-sm"
            onClick={() => setAvisoAbierto(false)}
          >
            Ahora no
          </button>
          <button
            className="boton-primario flex-1 py-2 text-sm"
            disabled={pendiente}
            onClick={aceptarAviso}
          >
            Entendido, activar
          </button>
        </div>
      </Modal>
    </div>
  );
}
