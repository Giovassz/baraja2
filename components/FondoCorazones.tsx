// Fondo ambiental: íconos que suben lentamente detrás de todo, en el color y la
// forma del tema activo (antes siempre eran corazones rosa fijos).
// Implementa BJ2-002, BJ2-041
'use client';

import { Icono, type NombreIcono } from '@/components/ui/iconos';
import { useIconoDeTema } from '@/components/ui/useTemaActivo';

const CORAZONES = [
  { left: '6%', size: 24, dur: 15, delay: 0, op: 0.16 },
  { left: '18%', size: 15, dur: 19, delay: 4, op: 0.11 },
  { left: '30%', size: 32, dur: 13, delay: 8, op: 0.14 },
  { left: '42%', size: 17, dur: 21, delay: 2, op: 0.1 },
  { left: '54%', size: 26, dur: 16, delay: 11, op: 0.16 },
  { left: '66%', size: 13, dur: 23, delay: 6, op: 0.1 },
  { left: '76%', size: 30, dur: 14, delay: 9, op: 0.14 },
  { left: '88%', size: 19, dur: 18, delay: 1, op: 0.12 },
  { left: '12%', size: 13, dur: 24, delay: 14, op: 0.09 },
  { left: '48%', size: 36, dur: 12, delay: 16, op: 0.13 },
  { left: '82%', size: 15, dur: 20, delay: 12, op: 0.1 },
  { left: '24%', size: 21, dur: 17, delay: 18, op: 0.13 },
];

export function FondoCorazones() {
  const IconoFondo = Icono[useIconoDeTema() as NombreIcono];

  return (
    <div className="corazones-fondo" aria-hidden>
      {CORAZONES.map((c, i) => (
        <span
          key={i}
          className="corazon-flota"
          style={{
            left: c.left,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
            ['--op' as string]: c.op,
          }}
        >
          <IconoFondo width={c.size} height={c.size} fill="currentColor" strokeWidth={0} />
        </span>
      ))}
    </div>
  );
}
