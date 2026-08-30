// Anillo de progreso circular para el WidgetVSComparativo (sección 5)
// Rediseño: trazo con gradiente de marca + resplandor.
// Implementa BJ2-026
'use client';

import { useId } from 'react';

interface AnilloProgresoProps {
  progreso: number; // 0..1
  tamano?: number;
  grosor?: number;
  children?: React.ReactNode;
}

export function AnilloProgreso({
  progreso,
  tamano = 84,
  grosor = 8,
  children,
}: AnilloProgresoProps) {
  const gid = useId().replace(/:/g, '');
  const p = Math.max(0, Math.min(1, progreso));
  const radio = (tamano - grosor) / 2;
  const circ = 2 * Math.PI * radio;
  const offset = circ * (1 - p);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: tamano, height: tamano }}
    >
      <svg
        width={tamano}
        height={tamano}
        className="-rotate-90"
        style={{ filter: p > 0 ? 'drop-shadow(0 0 6px rgba(232,93,138,0.45))' : undefined }}
      >
        <defs>
          <linearGradient id={`g-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E85D8A" />
            <stop offset="60%" stopColor="#B3486B" />
            <stop offset="100%" stopColor="#D9C9EC" />
          </linearGradient>
        </defs>
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke="#F7C6DA"
          strokeOpacity={0.5}
          strokeWidth={grosor}
        />
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke={`url(#g-${gid})`}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
