// Implementa BJ2-025 — pruebas de validación de uso de plot twists
import { describe, it, expect } from 'vitest';
import {
  validarUsoPlotTwist,
  estadoResultante,
  type PlotTwistMinimo,
  type CartaObjetivoMinima,
} from '@/lib/reglas/plot-twists';

const PAREJA = 'pareja-1';

const ptBloquear: PlotTwistMinimo = {
  id: 'pt1',
  usuario_id: 'ana',
  usado: false,
  efecto: 'bloquear_carta',
};
const ptRobar: PlotTwistMinimo = { ...ptBloquear, id: 'pt2', efecto: 'robar_carta' };

const cartaDeLuis: CartaObjetivoMinima = {
  id: 'c1',
  pareja_id: PAREJA,
  usuario_id: 'luis',
  estado: 'disponible',
};

describe('validarUsoPlotTwist', () => {
  it('permite bloquear una carta disponible de la pareja', () => {
    expect(validarUsoPlotTwist('ana', PAREJA, ptBloquear, cartaDeLuis)).toEqual({
      valido: true,
    });
  });

  it('rechaza si el plot twist no es del usuario', () => {
    expect(validarUsoPlotTwist('otro', PAREJA, ptBloquear, cartaDeLuis).motivo).toBe(
      'NO_ES_TU_PLOT_TWIST',
    );
  });

  it('rechaza si el plot twist ya fue usado', () => {
    expect(
      validarUsoPlotTwist('ana', PAREJA, { ...ptBloquear, usado: true }, cartaDeLuis).motivo,
    ).toBe('PLOT_TWIST_YA_USADO');
  });

  it('rechaza si la carta es de otra pareja', () => {
    expect(
      validarUsoPlotTwist('ana', PAREJA, ptBloquear, { ...cartaDeLuis, pareja_id: 'x' })
        .motivo,
    ).toBe('CARTA_FUERA_DE_TU_PAREJA');
  });

  it('rechaza si la carta no está disponible', () => {
    expect(
      validarUsoPlotTwist('ana', PAREJA, ptBloquear, { ...cartaDeLuis, estado: 'jugada' })
        .motivo,
    ).toBe('CARTA_OBJETIVO_NO_DISPONIBLE');
  });

  it('no deja robarte tu propia carta', () => {
    expect(
      validarUsoPlotTwist('ana', PAREJA, ptRobar, { ...cartaDeLuis, usuario_id: 'ana' })
        .motivo,
    ).toBe('NO_PUEDES_ROBARTE_A_TI_MISMO');
  });
});

describe('estadoResultante', () => {
  it('bloquear deja la carta bloqueada', () =>
    expect(estadoResultante('bloquear_carta')).toBe('bloqueada'));
  it('robar deja la carta original robada', () =>
    expect(estadoResultante('robar_carta')).toBe('robada'));
});
