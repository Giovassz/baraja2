// Lógica pura del ciclo semanal (sección 4.1). Sin dependencias de red: 100% testeable.
// Implementa BJ2-015
import { DIAS_POR_CICLO } from './constantes';

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const MS_POR_CICLO = DIAS_POR_CICLO * MS_POR_DIA;

/**
 * Número de ciclo semanal de una pareja.
 * ciclo = floor(días_transcurridos_desde(fecha_vinculacion) / 7) + 1
 * Si la pareja aún no se ha vinculado, devuelve 0.
 */
export function calcularCicloNumero(
  fechaVinculacion: Date | string | null,
  ahora: Date = new Date(),
): number {
  if (!fechaVinculacion) return 0;
  const inicio =
    fechaVinculacion instanceof Date ? fechaVinculacion : new Date(fechaVinculacion);
  if (Number.isNaN(inicio.getTime())) return 0;

  const transcurrido = ahora.getTime() - inicio.getTime();
  if (transcurrido < 0) return 0;

  return Math.floor(transcurrido / MS_POR_CICLO) + 1;
}

/** Fecha en que arranca un ciclo dado (ciclo 1 = fecha de vinculación). */
export function inicioDeCiclo(
  fechaVinculacion: Date | string,
  cicloNumero: number,
): Date {
  const inicio =
    fechaVinculacion instanceof Date ? fechaVinculacion : new Date(fechaVinculacion);
  return new Date(inicio.getTime() + (cicloNumero - 1) * MS_POR_CICLO);
}

/** Fecha en que termina un ciclo dado (inicio del siguiente). */
export function finDeCiclo(
  fechaVinculacion: Date | string,
  cicloNumero: number,
): Date {
  return inicioDeCiclo(fechaVinculacion, cicloNumero + 1);
}

/** Días completos que faltan para el próximo reinicio semanal. */
export function diasParaProximoReinicio(
  fechaVinculacion: Date | string | null,
  ahora: Date = new Date(),
): number {
  if (!fechaVinculacion) return 0;
  const cicloActual = calcularCicloNumero(fechaVinculacion, ahora);
  if (cicloActual === 0) return 0;
  const fin = finDeCiclo(fechaVinculacion, cicloActual);
  return Math.max(0, Math.ceil((fin.getTime() - ahora.getTime()) / MS_POR_DIA));
}

/** ¿Le toca a esta pareja un nuevo reparto de cartas? (usado por el cron). */
export function requiereNuevoReparto(
  fechaVinculacion: Date | string | null,
  ultimoCicloRepartido: number,
  ahora: Date = new Date(),
): boolean {
  return calcularCicloNumero(fechaVinculacion, ahora) > ultimoCicloRepartido;
}
