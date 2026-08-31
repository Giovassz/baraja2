// Baraja animada del hero: una carta al frente que se "juega" sola cada par de
// segundos, con las de atrás asomando. Da el gesto de swipe de Tinder.
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CaraCarta } from '@/components/ui/CartaJuego';
import type { NombreIconoCarta } from '@/components/ui/iconos';
import type { AcentoCarta } from '@/lib/reglas/carta';

const CARTAS: {
  icono: NombreIconoCarta;
  acento: AcentoCarta;
  nivel: 1 | 2 | 3;
  nombreNivel: string;
  texto: string;
}[] = [
  {
    icono: 'micro',
    acento: 'estandar',
    nivel: 1,
    nombreNivel: 'Común',
    texto: 'Mándale un audio con 3 cosas que te encantan de su risa.',
  },
  {
    icono: 'llama',
    acento: 'spicy',
    nivel: 2,
    nombreNivel: 'Especial',
    texto: 'Beso de despedida de 20 segundos antes de salir de casa.',
  },
  {
    icono: 'plato',
    acento: 'estandar',
    nivel: 1,
    nombreNivel: 'Común',
    texto: 'Cocinen algo nuevo juntos esta semana, sin receta.',
  },
  {
    icono: 'mano',
    acento: 'plot',
    nivel: 3,
    nombreNivel: 'Épica',
    texto: 'Plot twist: bloquéale una carta a tu pareja. Esta semana no.',
  },
  {
    icono: 'musica',
    acento: 'estandar',
    nivel: 2,
    nombreNivel: 'Especial',
    texto: 'Arma una playlist de 5 canciones que les recuerden a ustedes.',
  },
];

export function CartasHero() {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setI((v) => (v + 1) % CARTAS.length), 2600);
    return () => clearInterval(t);
  }, [pausado]);

  const orden = [0, 1, 2].map((k) => CARTAS[(i + k) % CARTAS.length]!);

  return (
    <div
      className="relative mx-auto aspect-[300/450] w-full max-w-[300px] select-none overflow-hidden pr-6"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-hidden
    >
      {/* Cartas de atrás asomando como una mano */}
      {orden.slice(1).reverse().map((c, idx) => {
        const profundidad = orden.length - 1 - idx; // 2, 1
        return (
          <div
            key={`${c.texto}-bg`}
            className="absolute left-0 top-0 w-[calc(100%-24px)]"
            style={{
              transform: `translate(${profundidad * 16}px, ${profundidad * -12}px) rotate(${profundidad * 4}deg) scale(${1 - profundidad * 0.05})`,
              transformOrigin: 'bottom right',
              opacity: 1 - profundidad * 0.28,
            }}
          >
            <CaraCarta
              icono={c.icono}
              acento={c.acento}
              nivel={c.nivel}
              nombreNivel={c.nombreNivel}
              texto={c.texto}
            />
          </div>
        );
      })}

      {/* Carta del frente que se "juega" */}
      <AnimatePresence>
        <motion.div
          key={orden[0]!.texto}
          className="absolute left-0 top-0 w-[calc(100%-24px)]"
          initial={{ x: -14, y: -14, rotate: -3, opacity: 0, scale: 0.94 }}
          animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          exit={{ x: 140, y: -20, rotate: 15, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        >
          <CaraCarta
            icono={orden[0]!.icono}
            acento={orden[0]!.acento}
            nivel={orden[0]!.nivel}
            nombreNivel={orden[0]!.nombreNivel}
            texto={orden[0]!.texto}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
