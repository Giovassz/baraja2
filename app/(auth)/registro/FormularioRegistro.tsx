// Formulario de registro con Server Action (validación zod en el servidor)
// Implementa BJ2-008
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { registrarse } from '@/lib/actions/auth';
import { CampoAuth } from '@/components/auth/CampoAuth';
import { Icono } from '@/components/ui/iconos';

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton-primario mt-1 h-12 w-full text-[15px]" disabled={pending}>
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          Crear cuenta
          <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}

export function FormularioRegistro() {
  const [estado, accion] = useFormState(registrarse, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <CampoAuth
        etiqueta="Tu nombre"
        icono={Icono.usuario}
        name="nombre"
        autoComplete="given-name"
        placeholder="Cómo te dice tu pareja"
        required
      />
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
        autoComplete="new-password"
        minLength={8}
        placeholder="Mínimo 8 caracteres"
        ayuda="Usa al menos 8 caracteres."
        required
      />

      <label className="flex items-start gap-2.5 rounded-2xl bg-white/[0.06] px-3.5 py-3 text-[13px] text-white">
        <input
          name="confirmoMayorEdad"
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-rosa-acento"
          required
        />
        <span>Confirmo que soy mayor de edad.</span>
      </label>

      {estado?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-2xl bg-rosa-acento/15 px-3.5 py-2.5 text-sm font-semibold text-rosa-acento"
        >
          <Icono.cerrar className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          {estado.mensaje}
        </p>
      )}

      <BotonCrear />
    </form>
  );
}
