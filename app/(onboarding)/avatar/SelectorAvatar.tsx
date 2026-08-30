// Cuadrícula de avatares con guardado vía Server Action (rediseño: íconos, sin emojis)
// Implementa BJ2-012
'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { motion } from 'framer-motion';
import { guardarAvatar } from '@/lib/actions/parejas';
import { CATALOGO_AVATARES } from '@/lib/reglas/avatares';
import { ICONOS_ANIMAL, Icono } from '@/components/ui/iconos';
import { BotonEnviar } from '@/components/ui/Boton';

export function SelectorAvatar({ avatarActual }: { avatarActual: string | null }) {
  const [estado, accion] = useFormState(guardarAvatar, null);
  const [seleccion, setSeleccion] = useState<string | null>(avatarActual);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="avatarId" value={seleccion ?? ''} />

      <div className="grid grid-cols-4 gap-3">
        {CATALOGO_AVATARES.map((a, i) => {
          const IconoAnimal = ICONOS_ANIMAL[a.icono];
          const activo = seleccion === a.id;
          return (
            <motion.button
              type="button"
              key={a.id}
              onClick={() => setSeleccion(a.id)}
              aria-pressed={activo}
              title={a.nombre}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.92 }}
              className={`relative flex aspect-square items-center justify-center rounded-full transition ${
                activo ? 'ring-4 ring-rosa-acento' : 'ring-2 ring-lavanda/40'
              }`}
              style={{ backgroundColor: a.color }}
            >
              <IconoAnimal className="h-1/2 w-1/2 text-white" strokeWidth={2} />
              {activo && (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-rosa-acento p-1 text-white">
                  <Icono.check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/50">
        Los avatares ilustrados llegan pronto. Por ahora elige tu animalito.
      </p>

      {estado?.error && (
        <p
          role="alert"
          className="rounded-widget bg-rosa-acento/15 px-3 py-2 text-sm text-rosa-acento"
        >
          {estado.mensaje}
        </p>
      )}

      <BotonEnviar className="w-full">Continuar</BotonEnviar>
    </form>
  );
}
