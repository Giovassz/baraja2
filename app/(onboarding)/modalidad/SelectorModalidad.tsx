// Elige la modalidad y pasa al paso de nombrar el espacio
// Implementa BJ2-009
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';

const OPCIONES = [
  {
    valor: 'distancia',
    emoji: '✈️',
    titulo: 'A distancia',
    detalle: 'Viven en ciudades distintas y se ven de vez en cuando.',
  },
  {
    valor: 'hibrida',
    emoji: '🔄',
    titulo: 'Híbrida',
    detalle: 'A veces cerca, a veces lejos. Una mezcla de ambas.',
  },
  {
    valor: 'fisica',
    emoji: '🏠',
    titulo: 'Presencial',
    detalle: 'Se ven casi a diario o viven juntos.',
  },
] as const;

export function SelectorModalidad() {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          onClick={() => setSeleccion(o.valor)}
          className={`rounded-widget border-2 p-4 text-left transition ${
            seleccion === o.valor
              ? 'border-rosa-acento bg-rosa-pastel/40'
              : 'border-lavanda/50 bg-white/60'
          }`}
        >
          <span className="text-2xl">{o.emoji}</span>
          <p className="mt-1 font-heading text-lg text-morado-marca">{o.titulo}</p>
          <p className="text-sm text-morado-marca/70">{o.detalle}</p>
        </button>
      ))}

      <Boton
        className="mt-2 w-full"
        disabled={!seleccion}
        onClick={() => router.push(`/nombrar-espacio?modalidad=${seleccion}`)}
      >
        Continuar
      </Boton>
    </div>
  );
}
