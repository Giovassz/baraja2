// Modal redondeado del sistema de diseño (sección 5, nunca esquinas rectas)
// Implementa BJ2-002
'use client';

import { useEffect } from 'react';

interface ModalProps {
  abierto: boolean;
  onCerrar?: () => void;
  titulo?: string;
  children: React.ReactNode;
  /** Oculta la X y el cierre por fondo (para avisos obligatorios). */
  bloqueante?: boolean;
}

export function Modal({ abierto, onCerrar, titulo, children, bloqueante = false }: ModalProps) {
  useEffect(() => {
    if (!abierto) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !bloqueante) onCerrar?.();
    };
    document.addEventListener('keydown', alTecla);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTecla);
      document.body.style.overflow = '';
    };
  }, [abierto, bloqueante, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-morado-marca/40 p-4 backdrop-blur-sm"
      onClick={() => !bloqueante && onCerrar?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-sm animate-aparece-suave rounded-widget bg-blanco-calido p-6 shadow-widget"
        onClick={(e) => e.stopPropagation()}
      >
        {(titulo || (!bloqueante && onCerrar)) && (
          <div className="mb-3 flex items-start justify-between gap-3">
            {titulo && <h2 className="text-xl">{titulo}</h2>}
            {!bloqueante && onCerrar && (
              <button
                onClick={onCerrar}
                aria-label="Cerrar"
                className="rounded-full px-2 text-2xl leading-none text-morado-marca/50 transition hover:text-rosa-acento"
              >
                ×
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
