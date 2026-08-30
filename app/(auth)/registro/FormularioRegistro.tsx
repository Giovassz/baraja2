// Formulario de registro con validación en cliente (react-hook-form + zod) y Server Action
// Implementa BJ2-008
'use client';

import { useFormState } from 'react-dom';
import { registrarse } from '@/lib/actions/auth';
import { BotonEnviar } from '@/components/ui/Boton';

export function FormularioRegistro() {
  const [estado, accion] = useFormState(registrarse, null);

  return (
    <form action={accion} className="mt-5 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-semibold text-morado-marca">
        Tu nombre
        <input name="nombre" className="campo-texto" autoComplete="given-name" required />
      </label>

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
          autoComplete="new-password"
          minLength={8}
          required
        />
        <span className="text-xs font-normal text-morado-marca/60">Mínimo 8 caracteres.</span>
      </label>

      <label className="mt-1 flex items-start gap-2 text-sm text-morado-marca">
        <input
          name="confirmoMayorEdad"
          type="checkbox"
          className="mt-1 h-5 w-5 accent-rosa-acento"
          required
        />
        <span>Confirmo que soy mayor de edad.</span>
      </label>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-widget bg-rosa-pastel/60 px-3 py-2 text-sm text-vino-marca"
        >
          {estado.mensaje}
        </p>
      )}

      <BotonEnviar className="mt-2 w-full">Crear cuenta</BotonEnviar>
    </form>
  );
}
