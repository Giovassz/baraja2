// Botón base del sistema de diseño (siempre con esquinas redondeadas, sección 5)
// Implementa BJ2-002
'use client';

import { forwardRef } from 'react';
import { useFormStatus } from 'react-dom';

type Variante = 'primario' | 'secundario';

interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  { variante = 'primario', cargando = false, className = '', children, disabled, ...props },
  ref,
) {
  const clase = variante === 'primario' ? 'boton-primario' : 'boton-secundario';
  return (
    <button
      ref={ref}
      className={`${clase} inline-flex items-center justify-center gap-2 ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});

/** Botón de envío que se deshabilita solo mientras el Server Action corre. */
export function BotonEnviar({
  children,
  variante = 'primario',
  className = '',
}: {
  children: React.ReactNode;
  variante?: Variante;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" variante={variante} cargando={pending} className={className}>
      {children}
    </Boton>
  );
}
