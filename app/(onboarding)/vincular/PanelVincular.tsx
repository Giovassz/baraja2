// Elección entre crear un espacio nuevo o unirse con un código
// Implementa BJ2-010, BJ2-011
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormState } from 'react-dom';
import { unirseConCodigo } from '@/lib/actions/parejas';
import { Boton, BotonEnviar } from '@/components/ui/Boton';

export function PanelVincular() {
  const [modo, setModo] = useState<'elegir' | 'unirme'>('elegir');
  const [estado, accion] = useFormState(unirseConCodigo, null);

  if (modo === 'elegir') {
    return (
      <section className="widget flex flex-col gap-4">
        <div>
          <h2 className="text-2xl">Vinculen su espacio</h2>
          <p className="mt-1 text-sm text-morado-marca/70">
            Uno de los dos crea el espacio y le comparte el código a la otra persona.
          </p>
        </div>

        <Link href="/modalidad" className="boton-primario w-full text-center">
          Crear un espacio nuevo
        </Link>

        <Boton variante="secundario" className="w-full" onClick={() => setModo('unirme')}>
          Tengo un código de invitación
        </Boton>
      </section>
    );
  }

  return (
    <section className="widget flex flex-col gap-4">
      <div>
        <h2 className="text-2xl">Unirme con un código</h2>
        <p className="mt-1 text-sm text-morado-marca/70">
          Pídele a tu pareja el código de 6 caracteres que le apareció al crear el espacio.
        </p>
      </div>

      <form action={accion} className="flex flex-col gap-3">
        <input
          name="codigo"
          className="campo-texto text-center text-2xl font-heading uppercase tracking-[0.4em]"
          maxLength={10}
          autoCapitalize="characters"
          autoComplete="one-time-code"
          placeholder="ABC123"
          required
        />

        {estado?.error && (
          <p
            role="alert"
            className="rounded-widget bg-rosa-pastel/60 px-3 py-2 text-sm text-vino-marca"
          >
            {estado.mensaje}
          </p>
        )}

        <BotonEnviar className="w-full">Unirme</BotonEnviar>
      </form>

      <button
        onClick={() => setModo('elegir')}
        className="text-sm font-semibold text-morado-marca/60"
      >
        ← Volver
      </button>
    </section>
  );
}
