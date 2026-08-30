// Formulario para renombrar el espacio compartido
// Implementa BJ2-013
'use client';

import { useFormState } from 'react-dom';
import { renombrarEspacio } from '@/lib/actions/parejas';
import { BotonEnviar } from '@/components/ui/Boton';

export function RenombrarEspacio({ nombreActual }: { nombreActual: string }) {
  const [estado, accion] = useFormState(renombrarEspacio, null);

  return (
    <form action={accion} className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-white">Nombre del espacio</label>
      <input
        name="nombreEspacio"
        defaultValue={nombreActual}
        className="campo-texto"
        maxLength={40}
        required
      />
      {estado?.mensaje && (
        <p className={`text-xs ${estado.ok ? 'text-white/70' : 'text-rosa-acento'}`}>
          {estado.mensaje}
        </p>
      )}
      <BotonEnviar variante="secundario" className="w-full">
        Guardar
      </BotonEnviar>
    </form>
  );
}
