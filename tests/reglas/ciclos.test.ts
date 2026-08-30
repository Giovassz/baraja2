// Implementa BJ2-015 — pruebas de la lógica del ciclo semanal
import { describe, it, expect } from 'vitest';
import {
  calcularCicloNumero,
  inicioDeCiclo,
  finDeCiclo,
  diasParaProximoReinicio,
  requiereNuevoReparto,
} from '@/lib/reglas/ciclos';

const vinc = new Date('2026-01-01T00:00:00Z');
const dia = (n: number) => new Date(vinc.getTime() + n * 86400000);

describe('calcularCicloNumero', () => {
  it('devuelve 0 si la pareja no se ha vinculado', () => {
    expect(calcularCicloNumero(null)).toBe(0);
  });

  it('el día de la vinculación es el ciclo 1', () => {
    expect(calcularCicloNumero(vinc, dia(0))).toBe(1);
    expect(calcularCicloNumero(vinc, dia(6))).toBe(1);
  });

  it('a los 7 días arranca el ciclo 2', () => {
    expect(calcularCicloNumero(vinc, dia(7))).toBe(2);
    expect(calcularCicloNumero(vinc, dia(13))).toBe(2);
    expect(calcularCicloNumero(vinc, dia(14))).toBe(3);
  });

  it('acepta fecha como string ISO', () => {
    expect(calcularCicloNumero(vinc.toISOString(), dia(7))).toBe(2);
  });

  it('devuelve 0 ante fechas futuras o inválidas', () => {
    expect(calcularCicloNumero(vinc, dia(-3))).toBe(0);
    expect(calcularCicloNumero('no-es-fecha')).toBe(0);
  });
});

describe('inicioDeCiclo / finDeCiclo', () => {
  it('el ciclo 1 empieza en la fecha de vinculación', () => {
    expect(inicioDeCiclo(vinc, 1).getTime()).toBe(vinc.getTime());
  });
  it('el ciclo 3 empieza 14 días después', () => {
    expect(inicioDeCiclo(vinc, 3).getTime()).toBe(dia(14).getTime());
  });
  it('el fin del ciclo 1 coincide con el inicio del ciclo 2', () => {
    expect(finDeCiclo(vinc, 1).getTime()).toBe(inicioDeCiclo(vinc, 2).getTime());
  });
});

describe('diasParaProximoReinicio', () => {
  it('en el día 0 faltan 7 días', () => {
    expect(diasParaProximoReinicio(vinc, dia(0))).toBe(7);
  });
  it('en el día 5 faltan 2 días', () => {
    expect(diasParaProximoReinicio(vinc, dia(5))).toBe(2);
  });
  it('devuelve 0 si no hay vinculación', () => {
    expect(diasParaProximoReinicio(null)).toBe(0);
  });
});

describe('requiereNuevoReparto', () => {
  it('es verdadero cuando el ciclo actual supera al último repartido', () => {
    expect(requiereNuevoReparto(vinc, 1, dia(7))).toBe(true);
  });
  it('es falso cuando ya se repartió el ciclo actual', () => {
    expect(requiereNuevoReparto(vinc, 2, dia(7))).toBe(false);
  });
});
