// Formulario de inicio de sesión con Server Action
// Implementa BJ2-008
'use client';

import { useFormState } from 'react-dom';
import { iniciarSesion } from '@/lib/actions/auth';
import { BotonEnviar } from '@/components/ui/Boton';

export function FormularioLogin() {
  const [estado, accion] = useFormState(iniciarSesion, null);

  return (
    <form action={accion} className="mt-5 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-semibold text-morado-marca">
        Correo
        <input
          name="email"
          type="email"
          className="campo-texto"
          autoComplete="email"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-morado-marca">
        Contraseña
        <input
          name="password"
          type="password"
          className="campo-texto"
          autoComplete="current-password"
          required
        />
      </label>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-widget bg-rosa-pastel/60 px-3 py-2 text-sm text-vino-marca"
        >
          {estado.mensaje}
        </p>
      )}

      <BotonEnviar className="mt-2 w-full">Entrar</BotonEnviar>
    </form>
  );
}
