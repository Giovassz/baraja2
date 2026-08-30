// Asigna a cada carta del juego una "cara" de naipe de póker (palo + valor) de forma
// determinista a partir de su id. Puro y testeable — no afecta la lógica de negocio,
// solo la presentación (rediseño solicitado).
// Implementa BJ2-017

export type Palo = 'corazon' | 'rombo' | 'trebol' | 'pica';

export interface CaraNaipe {
  palo: Palo;
  /** Valor mostrado en las esquinas: A, 2..10, J, Q, K */
  valor: string;
  /** true para corazón y rombo (se pintan en rosa acento). */
  rojo: boolean;
}

const PALOS: Palo[] = ['corazon', 'rombo', 'trebol', 'pica'];
const PALOS_ROJOS: Palo[] = ['corazon', 'rombo'];
const VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/** Hash estable (djb2) de una cadena → entero sin signo de 32 bits. */
export function hashCadena(texto: string): number {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) {
    h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

/**
 * Cara de naipe determinista para una carta.
 * @param id           id de la carta (cualquier cadena estable)
 * @param tipo         'spicy' fuerza palo rojo (corazón/rombo)
 */
export function caraDeNaipe(id: string, tipo: 'estandar' | 'spicy' = 'estandar'): CaraNaipe {
  const h = hashCadena(id);
  const valor = VALORES[h % VALORES.length]!;

  let palo: Palo;
  if (tipo === 'spicy') {
    palo = PALOS_ROJOS[(h >>> 5) % PALOS_ROJOS.length]!;
  } else {
    palo = PALOS[(h >>> 3) % PALOS.length]!;
  }

  return { palo, valor, rojo: PALOS_ROJOS.includes(palo) };
}

export const NOMBRE_PALO: Record<Palo, string> = {
  corazon: 'Corazones',
  rombo: 'Diamantes',
  trebol: 'Tréboles',
  pica: 'Picas',
};
