// Cuadrícula de avatares con guardado vía Server Action
// Implementa BJ2-012
'use client';

import { useFormState } from 'react-dom';
import Image from 'next/image';
import { useState } from 'react';
import { guardarAvatar } from '@/lib/actions/parejas';
import { CATALOGO_AVATARES } from '@/lib/reglas/avatares';
import { BotonEnviar } from '@/components/ui/Boton';

export function SelectorAvatar({ avatarActual }: { avatarActual: string | null }) {
  const [estado, accion] = useFormState(guardarAvatar, null);
  const [seleccion, setSeleccion] = useState<string | null>(avatarActual);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="avatarId" value={seleccion ?? ''} />

      <div className="grid grid-cols-4 gap-3">
        {CATALOGO_AVATARES.map((a) => (
          <button
            type="button"
            key={a.id}
            onClick={() => setSeleccion(a.id)}
            aria-pressed={seleccion === a.id}
            title={a.nombre}
            className={`aspect-square rounded-full p-1 transition ${
              seleccion === a.id ? 'ring-4 ring-rosa-acento' : 'ring-2 ring-lavanda/40'
            }`}
            style={{ backgroundColor: a.color }}
          >
            <Image src={a.archivo} alt={a.nombre} width={64} height={64} className="h-full w-full" />
          </button>
        ))}
      </div>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-widget bg-rosa-pastel/60 px-3 py-2 text-sm text-vino-marca"
        >
          {estado.mensaje}
        </p>
      )}

      <BotonEnviar className="w-full">Continuar</BotonEnviar>
    </form>
  );
}
