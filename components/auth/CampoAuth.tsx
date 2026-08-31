// Campo de formulario para las pantallas de autenticación: ícono guía + toggle de
// visibilidad para contraseñas. Diseño profesional del login.
// Implementa BJ2-008
'use client';

import { useId, useState } from 'react';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

interface CampoAuthProps extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  icono: LucideIcon;
  ayuda?: string;
}

export function CampoAuth({ etiqueta, icono: Ico, ayuda, type = 'text', ...props }: CampoAuthProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const esPassword = type === 'password';
  const tipoReal = esPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold text-white">
        {etiqueta}
      </label>
      <div className="relative">
        <Ico
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/45"
          strokeWidth={2}
        />
        <input
          id={id}
          type={tipoReal}
          className="h-12 w-full rounded-2xl border border-white/12 bg-white/[0.06] pl-11 pr-11 font-body text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-rosa-acento focus:bg-white/[0.1] focus:ring-4 focus:ring-rosa-acento/20"
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/45 transition hover:text-rosa-acento"
          >
            {visible ? (
              <Icono.ojoCerrado className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Icono.ojo className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
      {ayuda && <p className="text-xs text-white/55">{ayuda}</p>}
    </div>
  );
}
