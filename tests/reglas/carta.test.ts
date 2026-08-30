// Implementa BJ2-017, BJ2-026 — presentación de cartas y nivel de pareja
import { describe, it, expect } from 'vitest';
import {
  presentacionCarta,
  presentacionPlotTwist,
  nivelDesdePuntos,
  hashCadena,
} from '@/lib/reglas/carta';
import { nivelPareja } from '@/lib/reglas/niveles';

describe('presentacionCarta', () => {
  it('es determinista', () => {
    expect(presentacionCarta('c1', 'estandar')).toEqual(presentacionCarta('c1', 'estandar'));
  });

  it('las spicy usan el ícono de llama y acento spicy', () => {
    const p = presentacionCarta('x', 'spicy');
    expect(p.icono).toBe('llama');
    expect(p.acento).toBe('spicy');
  });

  it('el nivel sale de los puntos otorgados', () => {
    expect(presentacionCarta('a', 'estandar', 1).nivel).toBe(1);
    expect(presentacionCarta('a', 'estandar', 2).nivel).toBe(2);
    expect(presentacionCarta('a', 'estandar', 5).nivel).toBe(3);
  });

  it('reparte variedad de íconos', () => {
    const iconos = new Set(
      Array.from({ length: 50 }, (_, i) => presentacionCarta(`id${i}`, 'estandar').icono),
    );
    expect(iconos.size).toBeGreaterThan(3);
  });

  it('hashCadena es estable', () => {
    expect(hashCadena('ab')).toBe(hashCadena('ab'));
  });
});

describe('presentacionPlotTwist', () => {
  it('mapea el efecto a un ícono', () => {
    expect(presentacionPlotTwist('robar_carta').icono).toBe('mano');
    expect(presentacionPlotTwist('bloquear_carta').icono).toBe('candado');
  });
});

describe('nivelDesdePuntos', () => {
  it('límites', () => {
    expect(nivelDesdePuntos(0)).toBe(1);
    expect(nivelDesdePuntos(2)).toBe(2);
    expect(nivelDesdePuntos(9)).toBe(3);
  });
});

describe('nivelPareja', () => {
  it('empieza en nivel 1', () => {
    expect(nivelPareja(0).nivel).toBe(1);
    expect(nivelPareja(4).nivel).toBe(1);
  });
  it('sube cada 5 cartas cumplidas', () => {
    expect(nivelPareja(5).nivel).toBe(2);
    expect(nivelPareja(12).nivel).toBe(3);
  });
  it('reporta progreso dentro del nivel', () => {
    expect(nivelPareja(7).enNivel).toBe(2);
    expect(nivelPareja(7).progreso).toBeCloseTo(0.4);
  });
});
