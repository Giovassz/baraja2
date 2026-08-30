// Implementa BJ2-017 — la cara de naipe es determinista y bien formada
import { describe, it, expect } from 'vitest';
import { caraDeNaipe, hashCadena } from '@/lib/reglas/naipe';

describe('caraDeNaipe', () => {
  it('es determinista para el mismo id', () => {
    const a = caraDeNaipe('carta-123');
    const b = caraDeNaipe('carta-123');
    expect(a).toEqual(b);
  });

  it('devuelve un valor y palo válidos', () => {
    for (let i = 0; i < 200; i++) {
      const c = caraDeNaipe(`id-${i}-${i * 7}`);
      expect(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']).toContain(
        c.valor,
      );
      expect(['corazon', 'rombo', 'trebol', 'pica']).toContain(c.palo);
      expect(c.rojo).toBe(c.palo === 'corazon' || c.palo === 'rombo');
    }
  });

  it('las cartas spicy siempre reciben un palo rojo', () => {
    for (let i = 0; i < 100; i++) {
      const c = caraDeNaipe(`spicy-${i}`, 'spicy');
      expect(c.rojo).toBe(true);
    }
  });

  it('reparte variedad de palos entre ids distintos', () => {
    const palos = new Set(
      Array.from({ length: 40 }, (_, i) => caraDeNaipe(`x${i}`).palo),
    );
    expect(palos.size).toBeGreaterThan(1);
  });

  it('hashCadena es estable y sin signo', () => {
    expect(hashCadena('hola')).toBe(hashCadena('hola'));
    expect(hashCadena('hola')).toBeGreaterThanOrEqual(0);
  });
});
