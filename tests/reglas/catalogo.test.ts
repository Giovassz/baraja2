// Implementa BJ2-041 — el esquema del catálogo rechaza archivos mal formados
import { describe, it, expect } from 'vitest';
import { esquemaCatalogo } from '@/lib/validaciones/catalogo';
import catalogoPrueba from '@/seed/catalogo.json';

describe('esquemaCatalogo', () => {
  it('acepta el archivo de prueba seed/catalogo.json', () => {
    const r = esquemaCatalogo.safeParse(catalogoPrueba);
    expect(r.success).toBe(true);
  });

  it('rechaza una carta con tipo inválido', () => {
    const r = esquemaCatalogo.safeParse({
      cartas: [{ texto: 'x', tipo: 'raro', modalidad: 'todas', puntos_otorgados: 1 }],
      plot_twists: catalogoPrueba.plot_twists,
    });
    expect(r.success).toBe(false);
  });

  it('rechaza campos extra no declarados (strict)', () => {
    const r = esquemaCatalogo.safeParse({
      cartas: [
        { texto: 'x', tipo: 'estandar', modalidad: 'todas', puntos_otorgados: 1, extra: 1 },
      ],
      plot_twists: catalogoPrueba.plot_twists,
    });
    expect(r.success).toBe(false);
  });

  it('rechaza un catálogo sin plot twists', () => {
    const r = esquemaCatalogo.safeParse({ cartas: catalogoPrueba.cartas, plot_twists: [] });
    expect(r.success).toBe(false);
  });
});
