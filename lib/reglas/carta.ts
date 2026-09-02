// Presentación de una carta de juego (rediseño "picante"): sin número de póker.
// Cada carta estándar recibe un ícono determinista; el nivel sale de puntos_otorgados.
// Puro y testeable.
// Implementa BJ2-017
import type { NombreIconoCarta } from '@/components/ui/iconos';

export type AcentoCarta = 'estandar' | 'spicy' | 'plot';

export interface PresentacionCarta {
  icono: NombreIconoCarta;
  /** 1 = común, 2 = especial, 3 = épica */
  nivel: 1 | 2 | 3;
  nombreNivel: string;
  acento: AcentoCarta;
}

const ICONOS_ESTANDAR: NombreIconoCarta[] = [
  'regalo',
  'musica',
  'cafe',
  'camara',
  'mensaje',
  'llamada',
  'mapa',
  'estrella',
  'sol',
  'luna',
  'plato',
  'juego',
  'pluma',
  'flor',
  'micro',
  'video',
];

const NOMBRE_NIVEL: Record<1 | 2 | 3, string> = {
  1: 'Común',
  2: 'Especial',
  3: 'Épica',
};

/** Hash estable (djb2). */
export function hashCadena(texto: string): number {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) {
    h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

export function nivelDesdePuntos(puntosOtorgados: number): 1 | 2 | 3 {
  if (puntosOtorgados >= 3) return 3;
  if (puntosOtorgados === 2) return 2;
  return 1;
}

export function presentacionCarta(
  id: string,
  tipo: 'estandar' | 'spicy',
  puntosOtorgados = 1,
): PresentacionCarta {
  const h = hashCadena(id);
  const nivel = nivelDesdePuntos(puntosOtorgados);

  if (tipo === 'spicy') {
    return { icono: 'llama', nivel, nombreNivel: NOMBRE_NIVEL[nivel], acento: 'spicy' };
  }

  return {
    icono: ICONOS_ESTANDAR[h % ICONOS_ESTANDAR.length]!,
    nivel,
    nombreNivel: NOMBRE_NIVEL[nivel],
    acento: 'estandar',
  };
}

/** Presentación de un plot twist según su efecto. */
export function presentacionPlotTwist(efecto: 'bloquear_carta' | 'robar_carta' | 'otro'): {
  icono: NombreIconoCarta;
  acento: AcentoCarta;
  /** Color propio del efecto (frío para bloqueo, cálido para robo), para distinguirlos
   * de un vistazo en la Tienda sin depender solo del texto. */
  color: string;
  /** Explicación de una línea, para no tener que abrir el detalle para saber qué hace. */
  hint: string;
} {
  if (efecto === 'robar_carta') {
    return { icono: 'mano', acento: 'plot', color: '#ffb37a', hint: 'Le roba una carta a tu pareja' };
  }
  if (efecto === 'bloquear_carta') {
    return {
      icono: 'candado',
      acento: 'plot',
      color: '#7dd3fc',
      hint: 'Bloquea una carta de tu pareja',
    };
  }
  return { icono: 'chispa', acento: 'plot', color: '#c9b4ec', hint: 'Efecto especial' };
}
