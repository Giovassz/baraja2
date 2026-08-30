// Micro-animación de celebración (sección 5): confeti + corazones ascendentes.
// Nunca usar alert() ni un toast genérico para acciones de éxito.
// Implementa BJ2-021
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

const COLORES = ['#F7C6DA', '#E85D8A', '#D9C9EC', '#BFEAD1'];

export function lanzarConfeti() {
  if (typeof window === 'undefined') return;
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducido) return;
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: COLORES,
    scalar: 0.9,
  });
}

/**
 * Hook de celebración: expone `celebrar()` y renderiza los corazones ascendentes.
 * Uso:
 *   const { celebrar, Corazones } = useCelebracion();
 *   ...
 *   <Corazones />
 */
export function useCelebracion() {
  const [activo, setActivo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const celebrar = useCallback(() => {
    lanzarConfeti();
    setActivo(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setActivo(false), 1800);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const Corazones = useCallback(() => {
    if (!activo) return null;
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center gap-3">
        {['💗', '💖', '💕', '💝', '💓'].map((c, i) => (
          <span
            key={i}
            className="animate-corazon-sube text-3xl"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {c}
          </span>
        ))}
      </div>
    );
  }, [activo]);

  return { celebrar, Corazones };
}
