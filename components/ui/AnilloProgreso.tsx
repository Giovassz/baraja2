// Anillo de progreso circular para el WidgetVSComparativo (sección 5)
// Implementa BJ2-026

interface AnilloProgresoProps {
  progreso: number; // 0..1
  tamano?: number;
  grosor?: number;
  color?: string;
  children?: React.ReactNode;
}

export function AnilloProgreso({
  progreso,
  tamano = 84,
  grosor = 8,
  color = '#E85D8A',
  children,
}: AnilloProgresoProps) {
  const p = Math.max(0, Math.min(1, progreso));
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia * (1 - p);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: tamano, height: tamano }}>
      <svg width={tamano} height={tamano} className="-rotate-90">
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke="#F7C6DA"
          strokeWidth={grosor}
        />
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
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
