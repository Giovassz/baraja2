// Micro-animación de celebración (sección 5): confeti + corazones ascendentes.
// Sin emojis: los corazones son íconos. Nunca alert() ni toast genérico.
// Implementa BJ2-021
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Icono } from './iconos';

const COLORES = ['#F7C6DA', '#E85D8A', '#D9C9EC', '#BFEAD1'];

export function lanzarConfeti() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const disparo = (opts: confetti.Options) =>
    confetti({ colors: COLORES, disableForReducedMotion: true, ...opts });
  disparo({ particleCount: 70, spread: 60, origin: { y: 0.7 }, scalar: 0.9 });
  disparo({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.75 } });
  disparo({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.75 } });
}

/**
 * Hook de celebración: `celebrar()` dispara confeti + corazones ascendentes,
 * que se renderizan con <Corazones />.
 */
export function useCelebracion() {
  const [activo, setActivo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const celebrar = useCallback(() => {
    lanzarConfeti();
    setActivo(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setActivo(false), 1900);
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
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icono.corazon
            key={i}
            className="h-7 w-7 animate-corazon-sube text-rosa-acento"
            style={{ animationDelay: `${i * 90}ms` }}
            fill="currentColor"
            strokeWidth={0}
          />
        ))}
      </div>
    );
  }, [activo]);

  return { celebrar, Corazones };
}
