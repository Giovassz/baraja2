// Modal redondeado del sistema de diseño (sección 5, nunca esquinas rectas)
// Implementa BJ2-002
'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icono } from './iconos';

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

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !bloqueante && onCerrar?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className="w-full max-w-sm rounded-widget border border-white/10 bg-superficie p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)]"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {(titulo || (!bloqueante && onCerrar)) && (
              <div className="mb-3 flex items-start justify-between gap-3">
                {titulo && <h2 className="text-xl">{titulo}</h2>}
                {!bloqueante && onCerrar && (
                  <button
                    onClick={onCerrar}
                    aria-label="Cerrar"
                    className="rounded-full p-1 text-white/50 transition hover:bg-white/[0.06] hover:text-rosa-acento"
                  >
                    <Icono.cerrar className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
