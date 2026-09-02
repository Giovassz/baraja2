// Micro-animación de celebración (sección 5): confeti + corazones ascendentes.
// Sin emojis: los corazones son íconos. Nunca alert() ni toast genérico.
// Implementa BJ2-021
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Icono, type NombreIcono } from './iconos';
import { useIconoDeTema } from './useTemaActivo';

// canvas-confetti pinta en un <canvas>, así que no puede leer var() en vivo — se
// resuelve el color del tema actual una sola vez, al momento de lanzar el confeti.
function colorDeTema(variable: string, respaldo: string): string {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return valor ? `rgb(${valor.replace(/\s+/g, ',')})` : respaldo;
}

export function lanzarConfeti() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colores = [
    colorDeTema('--c-pastel', '#F7C6DA'),
    colorDeTema('--c-acento', '#E85D8A'),
    '#D9C9EC',
    '#BFEAD1',
  ];
  const disparo = (opts: confetti.Options) =>
    confetti({ colors: colores, disableForReducedMotion: true, ...opts });
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
  // Se llama aquí, en el hook de verdad — adentro de useCallback cuenta como
  // "dentro de un callback" para el lint de reglas de hooks, aunque en la práctica
  // solo se invoque al renderizar.
  const iconoTema = useIconoDeTema();

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
    const IconoCelebracion = Icono[iconoTema as NombreIcono];
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <IconoCelebracion
            key={i}
            className="h-7 w-7 animate-corazon-sube text-rosa-acento"
            style={{ animationDelay: `${i * 90}ms` }}
            fill="currentColor"
            strokeWidth={0}
          />
        ))}
      </div>
    );
  }, [activo, iconoTema]);

  return { celebrar, Corazones };
}
