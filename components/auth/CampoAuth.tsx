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
      <label htmlFor={id} className="text-[13px] font-bold text-morado-marca">
        {etiqueta}
      </label>
      <div className="relative">
        <Ico
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-morado-marca/40"
          strokeWidth={2}
        />
        <input
          id={id}
          type={tipoReal}
          className="h-12 w-full rounded-2xl border-2 border-lavanda/60 bg-white pl-11 pr-11 font-body text-[15px] text-morado-marca outline-none transition placeholder:text-morado-marca/35 focus:border-rosa-acento focus:ring-4 focus:ring-rosa-acento/15"
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-morado-marca/40 transition hover:text-rosa-acento"
          >
            {visible ? (
              <Icono.ojoCerrado className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Icono.ojo className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
      {ayuda && <p className="text-xs text-morado-marca/55">{ayuda}</p>}
    </div>
  );
}
