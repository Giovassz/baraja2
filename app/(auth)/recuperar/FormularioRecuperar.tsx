// Formulario para pedir el correo de recuperación de contraseña
// Implementa BJ2-008
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { solicitarRecuperacion } from '@/lib/actions/auth';
import { CampoAuth } from '@/components/auth/CampoAuth';
import { Icono } from '@/components/ui/iconos';

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton-primario mt-1 h-12 w-full text-[15px]" disabled={pending}>
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          Mandar link
          <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}

export function FormularioRecuperar() {
  const [estado, accion] = useFormState(solicitarRecuperacion, null);

  if (estado?.ok) {
    return (
      <p className="flex items-start gap-2.5 rounded-2xl bg-white/[0.06] px-3.5 py-3 text-sm font-semibold text-white">
        <Icono.sobre className="mt-0.5 h-4 w-4 shrink-0 text-rosa-acento" strokeWidth={2.5} />
        {estado.mensaje}
      </p>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4">
      <CampoAuth
        etiqueta="Correo"
        icono={Icono.sobre}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        required
      />

      {estado?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-2xl bg-rosa-acento/15 px-3.5 py-2.5 text-sm font-semibold text-rosa-acento"
        >
          <Icono.cerrar className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          {estado.mensaje}
        </p>
      )}

      <BotonEnviar />
    </form>
  );
}
