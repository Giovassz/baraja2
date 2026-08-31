// Formulario para guardar la contraseña nueva (llega desde el link del correo)
// Implementa BJ2-008
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { actualizarPassword } from '@/lib/actions/auth';
import { CampoAuth } from '@/components/auth/CampoAuth';
import { Icono } from '@/components/ui/iconos';

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton-primario mt-1 h-12 w-full text-[15px]" disabled={pending}>
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <>
          Guardar contraseña
          <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}

export function FormularioNuevaPassword() {
  const [estado, accion] = useFormState(actualizarPassword, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <CampoAuth
        etiqueta="Contraseña nueva"
        icono={Icono.candado}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        placeholder="Mínimo 8 caracteres"
        ayuda="Usa al menos 8 caracteres."
        required
      />
      <CampoAuth
        etiqueta="Confírmala"
        icono={Icono.candado}
        name="confirmarPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        placeholder="Escríbela de nuevo"
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

      <BotonGuardar />
    </form>
  );
}
