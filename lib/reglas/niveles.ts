// Nivel de la pareja: sube según cuántas cartas han cumplido en total (todos los ciclos).
// Puro y testeable.
// Implementa BJ2-026
import { CARTAS_CUMPLIDAS_POR_NIVEL } from './constantes';

export interface EstadoNivel {
  nivel: number;
  /** Cartas cumplidas dentro del nivel actual. */
  enNivel: number;
  /** Cartas cumplidas necesarias para completar el nivel actual. */
  paraSubir: number;
  /** Progreso 0..1 dentro del nivel actual. */
  progreso: number;
}

export function nivelPareja(cartasCumplidasTotales: number): EstadoNivel {
  const total = Math.max(0, Math.floor(cartasCumplidasTotales));
  const nivel = Math.floor(total / CARTAS_CUMPLIDAS_POR_NIVEL) + 1;
  const enNivel = total % CARTAS_CUMPLIDAS_POR_NIVEL;
  return {
    nivel,
    enNivel,
    paraSubir: CARTAS_CUMPLIDAS_POR_NIVEL,
    progreso: enNivel / CARTAS_CUMPLIDAS_POR_NIVEL,
  };
}
