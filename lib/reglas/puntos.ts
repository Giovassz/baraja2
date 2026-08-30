// Lógica pura de puntos semanales (sección 4.3 y 4.4). Testeable sin base de datos.
// Implementa BJ2-024
import {
  PUNTOS_POR_CARTA_CUMPLIDA,
  PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST,
} from './constantes';

/** Puntos totales tras cumplir `cartasCumplidas` cartas en el ciclo. */
export function puntosPorCartasCumplidas(cartasCumplidas: number): number {
  return Math.max(0, Math.floor(cartasCumplidas)) * PUNTOS_POR_CARTA_CUMPLIDA;
}

/** Cuántos plot twists corresponden a una cantidad de puntos acumulados. */
export function plotTwistsMerecidos(puntos: number): number {
  if (puntos <= 0) return 0;
  return Math.floor(puntos / PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST);
}

/**
 * Cuántos plot twists se deben desbloquear ahora, dado el total de puntos y
 * los que ya estaban desbloqueados en el ciclo (sección 4.4).
 */
export function plotTwistsADesbloquear(
  puntosTotales: number,
  yaDesbloqueados: number,
): number {
  return Math.max(0, plotTwistsMerecidos(puntosTotales) - yaDesbloqueados);
}

/** ¿El sumar `delta` puntos cruza un nuevo múltiplo del umbral? */
export function cruzaUmbral(puntosAntes: number, delta: number): boolean {
  return plotTwistsMerecidos(puntosAntes + delta) > plotTwistsMerecidos(puntosAntes);
}

/** Puntos que faltan para el siguiente plot twist. */
export function puntosParaSiguientePlotTwist(puntos: number): number {
  const restante = puntos % PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST;
  return restante === 0 ? PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST : PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST - restante;
}

/**
 * Progreso (0..1) hacia el siguiente plot twist, para el anillo circular del
 * WidgetVSComparativo (sección 5).
 */
export function progresoHaciaPlotTwist(puntos: number): number {
  const restante = puntos % PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST;
  if (puntos > 0 && restante === 0) return 1;
  return restante / PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST;
}

export type EtiquetaProgreso = 'Excelente' | 'Bien' | 'Sigue así';

/** Etiqueta textual del WidgetVSComparativo según el progreso (sección 5). */
export function etiquetaProgreso(progreso: number): EtiquetaProgreso {
  if (progreso >= 0.8) return 'Excelente';
  if (progreso >= 0.4) return 'Bien';
  return 'Sigue así';
}
