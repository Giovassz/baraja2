// Formulario de inicio de sesión con Server Action
// Implementa BJ2-008
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { iniciarSesion } from '@/lib/actions/auth';
import { CampoAuth } from '@/components/auth/CampoAuth';
import { Icono } from '@/components/ui/iconos';

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton-primario mt-1 h-12 w-full text-[15px]" disabled={pending}>
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          Entrar
          <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}

export function FormularioLogin() {
  const [estado, accion] = useFormState(iniciarSesion, null);

  return (
    <form action={accion} className="mt-6 flex flex-col gap-4">
      <CampoAuth
        etiqueta="Correo"
        icono={Icono.sobre}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        required
      />
      <CampoAuth
        etiqueta="Contraseña"
        icono={Icono.candado}
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Tu contraseña"
        required
      />

      {estado?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-2xl bg-rosa-pastel/60 px-3.5 py-2.5 text-sm font-semibold text-vino-marca"
        >
          <Icono.cerrar className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          {estado.mensaje}
        </p>
      )}

      <BotonEntrar />
    </form>
  );
}
