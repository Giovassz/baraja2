// Modelo puro y testeable de las transiciones de una carta y de la suma de puntos
// (sección 4.3). Es el espejo en TypeScript de las funciones SQL jugar_carta /
// confirmar_cumplida de supabase/migrations/20260101001300_rpc_mecanica.sql: si cambias una,
// cambia la otra. Se usa en las pruebas de Fase 2 y como referencia de comportamiento.
// Implementa BJ2-018, BJ2-019, BJ2-020
import type { EstadoCarta } from '@/lib/supabase/tipos';
import { PUNTOS_POR_CARTA_CUMPLIDA } from './constantes';
import { plotTwistsADesbloquear } from './puntos';

export interface CartaEnJuego {
  id: string;
  duenoId: string;
  receptorId: string | null;
  cicloNumero: number;
  estado: EstadoCarta;
  /** El receptor tocó el corazón para avisar "ya lo hice"; falta que el dueño lo confirme. */
  reclamada?: boolean;
}

export type ResultadoMecanica<T> =
  | { ok: true; valor: T }
  | { ok: false; error: string };

/** jugarCarta: el dueño juega una carta disponible hacia su pareja. */
export function jugarCarta(
  carta: CartaEnJuego,
  actorId: string,
  parejaDelActor: string,
  otroMiembroId: string | null,
): ResultadoMecanica<CartaEnJuego> {
  if (carta.duenoId !== actorId) return { ok: false, error: 'NO_ERES_DUENO' };
  if (carta.estado !== 'disponible') return { ok: false, error: 'CARTA_NO_DISPONIBLE' };
  if (!otroMiembroId) return { ok: false, error: 'PAREJA_INCOMPLETA' };
  void parejaDelActor;
  return {
    ok: true,
    valor: { ...carta, estado: 'jugada', receptorId: otroMiembroId },
  };
}

export interface EstadoPuntos {
  /** puntos por usuario en el ciclo */
  puntosPorUsuario: Record<string, number>;
  /** plot twists ya desbloqueados por usuario en el ciclo */
  plotTwistsPorUsuario: Record<string, number>;
}

export interface ResultadoCumplir {
  carta: CartaEnJuego;
  estadoPuntos: EstadoPuntos;
  plotTwistsNuevos: number;
  usuarioQueGanoPuntos: string;
}

/**
 * reclamarCumplida: el receptor toca el corazón para avisar que ya cumplió el
 * reto en la vida real. Todavía no otorga el punto — solo deja la carta lista
 * para que quien la mandó la confirme.
 */
export function reclamarCumplida(
  carta: CartaEnJuego,
  actorId: string,
): ResultadoMecanica<CartaEnJuego> {
  if (carta.receptorId !== actorId) return { ok: false, error: 'NO_ERES_RECEPTOR' };
  if (carta.estado !== 'jugada') return { ok: false, error: 'CARTA_NO_JUGADA' };
  if (carta.reclamada) return { ok: false, error: 'YA_RECLAMADA' };
  return { ok: true, valor: { ...carta, reclamada: true } };
}

/**
 * confirmarCumplida: quien mandó la carta (el dueño original) confirma que su
 * pareja avisó que lo cumplió. Suma PUNTOS_POR_CARTA_CUMPLIDA a quien lo cumplió
 * (el RECEPTOR, no quien lo mandó) y evalúa el umbral de plot twists.
 */
export function confirmarCumplida(
  carta: CartaEnJuego,
  actorId: string,
  estadoPuntos: EstadoPuntos,
): ResultadoMecanica<ResultadoCumplir> {
  if (carta.duenoId !== actorId) return { ok: false, error: 'NO_ERES_QUIEN_LA_MANDO' };
  if (carta.estado !== 'jugada') return { ok: false, error: 'CARTA_NO_JUGADA' };
  if (!carta.reclamada) return { ok: false, error: 'AUN_NO_RECLAMADA' };

  const ganador = carta.receptorId;
  if (!ganador) return { ok: false, error: 'PAREJA_INCOMPLETA' };
  const puntosAntes = estadoPuntos.puntosPorUsuario[ganador] ?? 0;
  const puntosDespues = puntosAntes + PUNTOS_POR_CARTA_CUMPLIDA;

  const yaDesbloqueados = estadoPuntos.plotTwistsPorUsuario[ganador] ?? 0;
  const nuevos = plotTwistsADesbloquear(puntosDespues, yaDesbloqueados);

  const nuevoEstado: EstadoPuntos = {
    puntosPorUsuario: { ...estadoPuntos.puntosPorUsuario, [ganador]: puntosDespues },
    plotTwistsPorUsuario: {
      ...estadoPuntos.plotTwistsPorUsuario,
      [ganador]: yaDesbloqueados + nuevos,
    },
  };

  return {
    ok: true,
    valor: {
      carta: { ...carta, estado: 'cumplida' },
      estadoPuntos: nuevoEstado,
      plotTwistsNuevos: nuevos,
      usuarioQueGanoPuntos: ganador,
    },
  };
}

export function estadoPuntosVacio(): EstadoPuntos {
  return { puntosPorUsuario: {}, plotTwistsPorUsuario: {} };
}
