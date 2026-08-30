// Implementa BJ2-024 — pruebas del sistema de puntos y umbral de plot twists
import { describe, it, expect } from 'vitest';
import {
  puntosPorCartasCumplidas,
  plotTwistsMerecidos,
  plotTwistsADesbloquear,
  cruzaUmbral,
  puntosParaSiguientePlotTwist,
  progresoHaciaPlotTwist,
  etiquetaProgreso,
} from '@/lib/reglas/puntos';
import {
  PUNTOS_POR_CARTA_CUMPLIDA,
  PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST,
} from '@/lib/reglas/constantes';

describe('constantes de negocio', () => {
  it('coinciden con los supuestos S1 y S2', () => {
    expect(PUNTOS_POR_CARTA_CUMPLIDA).toBe(1);
    expect(PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST).toBe(3);
  });
});

describe('puntosPorCartasCumplidas', () => {
  it('1 punto por carta', () => {
    expect(puntosPorCartasCumplidas(0)).toBe(0);
    expect(puntosPorCartasCumplidas(5)).toBe(5);
  });
  it('ignora valores negativos o fraccionarios', () => {
    expect(puntosPorCartasCumplidas(-2)).toBe(0);
    expect(puntosPorCartasCumplidas(2.9)).toBe(2);
  });
});

describe('plotTwistsMerecidos', () => {
  it('cada 3 puntos = 1 plot twist', () => {
    expect(plotTwistsMerecidos(0)).toBe(0);
    expect(plotTwistsMerecidos(2)).toBe(0);
    expect(plotTwistsMerecidos(3)).toBe(1);
    expect(plotTwistsMerecidos(6)).toBe(2);
    expect(plotTwistsMerecidos(7)).toBe(2);
  });
});

describe('plotTwistsADesbloquear', () => {
  it('descuenta los que ya estaban desbloqueados', () => {
    expect(plotTwistsADesbloquear(6, 1)).toBe(1);
    expect(plotTwistsADesbloquear(6, 2)).toBe(0);
    expect(plotTwistsADesbloquear(9, 1)).toBe(2);
  });
});

describe('cruzaUmbral', () => {
  it('detecta cuando sumar puntos desbloquea un nuevo plot twist', () => {
    expect(cruzaUmbral(2, 1)).toBe(true); // 2 -> 3
    expect(cruzaUmbral(3, 1)).toBe(false); // 3 -> 4
    expect(cruzaUmbral(5, 1)).toBe(true); // 5 -> 6
  });
});

describe('progreso hacia el siguiente plot twist', () => {
  it('puntos que faltan', () => {
    expect(puntosParaSiguientePlotTwist(0)).toBe(3);
    expect(puntosParaSiguientePlotTwist(1)).toBe(2);
    expect(puntosParaSiguientePlotTwist(3)).toBe(3);
  });
  it('fracción de progreso 0..1', () => {
    expect(progresoHaciaPlotTwist(0)).toBe(0);
    expect(progresoHaciaPlotTwist(1)).toBeCloseTo(1 / 3);
    expect(progresoHaciaPlotTwist(3)).toBe(1);
  });
});

describe('etiquetaProgreso (WidgetVSComparativo)', () => {
  it('Excelente si >= 80%', () => expect(etiquetaProgreso(0.8)).toBe('Excelente'));
  it('Bien si >= 40%', () => expect(etiquetaProgreso(0.4)).toBe('Bien'));
  it('Sigue así si < 40%', () => expect(etiquetaProgreso(0.39)).toBe('Sigue así'));
});
