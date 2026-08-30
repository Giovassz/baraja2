// Modelo puro y testeable de las transiciones de una carta y de la suma de puntos
// (sección 4.3). Es el espejo en TypeScript de las funciones SQL jugar_carta /
// confirmar_cumplida de supabase/migrations/013_rpc_mecanica.sql: si cambias una,
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
 * confirmarCumplida: el receptor confirma que la carta jugada se cumplió.
 * Suma PUNTOS_POR_CARTA_CUMPLIDA al DUEÑO ORIGINAL (quien propuso el reto) y
 * evalúa el umbral de plot twists.
 */
export function confirmarCumplida(
  carta: CartaEnJuego,
  actorId: string,
  estadoPuntos: EstadoPuntos,
): ResultadoMecanica<ResultadoCumplir> {
  if (carta.receptorId !== actorId) return { ok: false, error: 'NO_ERES_RECEPTOR' };
  if (carta.estado !== 'jugada') return { ok: false, error: 'CARTA_NO_JUGADA' };

  const ganador = carta.duenoId;
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
