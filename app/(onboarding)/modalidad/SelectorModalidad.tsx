// Elige la modalidad y pasa al paso de nombrar el espacio (rediseño: íconos)
// Implementa BJ2-009
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Boton } from '@/components/ui/Boton';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

const OPCIONES: {
  valor: string;
  icono: LucideIcon;
  titulo: string;
  detalle: string;
}[] = [
  {
    valor: 'distancia',
    icono: Icono.avion,
    titulo: 'A distancia',
    detalle: 'Viven en ciudades distintas y se ven de vez en cuando.',
  },
  {
    valor: 'hibrida',
    icono: Icono.hibrido,
    titulo: 'Híbrida',
    detalle: 'A veces cerca, a veces lejos. Una mezcla de ambas.',
  },
  {
    valor: 'fisica',
    icono: Icono.casa,
    titulo: 'Presencial',
    detalle: 'Se ven casi a diario o viven juntos.',
  },
];

export function SelectorModalidad() {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {OPCIONES.map((o, i) => {
        const Ico = o.icono;
        const activo = seleccion === o.valor;
        return (
          <motion.button
            key={o.valor}
            onClick={() => setSeleccion(o.valor)}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-start gap-3 rounded-widget border-2 p-4 text-left transition ${
              activo
                ? 'border-rosa-acento bg-rosa-pastel/40'
                : 'border-lavanda/50 bg-white/60'
            }`}
          >
            <span
              className={`rounded-full p-2 ${
                activo ? 'bg-rosa-acento text-white' : 'bg-white/70 text-vino-marca'
              }`}
            >
              <Ico className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span>
              <span className="block font-heading text-lg text-morado-marca">{o.titulo}</span>
              <span className="block text-sm text-morado-marca/70">{o.detalle}</span>
            </span>
          </motion.button>
        );
      })}

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
