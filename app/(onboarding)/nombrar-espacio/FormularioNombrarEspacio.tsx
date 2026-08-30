// Formulario que crea el espacio de pareja (modalidad + nombre)
// Implementa BJ2-013
'use client';

import { useFormState } from 'react-dom';
import { crearEspacio } from '@/lib/actions/parejas';
import { BotonEnviar } from '@/components/ui/Boton';
import type { Modalidad } from '@/lib/supabase/tipos';

export function FormularioNombrarEspacio({ modalidad }: { modalidad: Modalidad }) {
  const [estado, accion] = useFormState(crearEspacio, null);

  return (
    <form action={accion} className="flex flex-col gap-3">
      <input type="hidden" name="modalidad" value={modalidad} />

      <label className="flex flex-col gap-1 text-sm font-semibold text-morado-marca">
        Nombre del espacio
        <input
          name="nombreEspacio"
          className="campo-texto"
          placeholder="Ej. Nuestro rincón"
          maxLength={40}
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

      <BotonEnviar className="mt-2 w-full">Crear espacio</BotonEnviar>
    </form>
  );
}
