// Implementa BJ2-018..022 — un ciclo completo jugar -> confirmar -> sumar puntos (criterio Fase 2)
import { describe, it, expect } from 'vitest';
import {
  jugarCarta,
  confirmarCumplida,
  estadoPuntosVacio,
  type CartaEnJuego,
} from '@/lib/reglas/mecanica';

const ANA = 'ana';
const LUIS = 'luis';
const PAREJA = 'pareja-1';

function cartaDe(dueno: string): CartaEnJuego {
  return {
    id: `carta-${dueno}`,
    duenoId: dueno,
    receptorId: null,
    cicloNumero: 1,
    estado: 'disponible',
  };
}

describe('ciclo completo de una carta', () => {
  it('Ana juega una carta hacia Luis y Luis la confirma; Ana gana el punto', () => {
    let carta = cartaDe(ANA);

    const jugada = jugarCarta(carta, ANA, PAREJA, LUIS);
    expect(jugada.ok).toBe(true);
    if (!jugada.ok) return;
    carta = jugada.valor;
    expect(carta.estado).toBe('jugada');
    expect(carta.receptorId).toBe(LUIS);

    const cumplida = confirmarCumplida(carta, LUIS, estadoPuntosVacio());
    expect(cumplida.ok).toBe(true);
    if (!cumplida.ok) return;

    expect(cumplida.valor.carta.estado).toBe('cumplida');
    expect(cumplida.valor.usuarioQueGanoPuntos).toBe(ANA);
    expect(cumplida.valor.estadoPuntos.puntosPorUsuario[ANA]).toBe(1);
    expect(cumplida.valor.plotTwistsNuevos).toBe(0);
  });

  it('no deja que un tercero juegue la carta de Ana', () => {
    const r = jugarCarta(cartaDe(ANA), LUIS, PAREJA, ANA);
    expect(r).toEqual({ ok: false, error: 'NO_ERES_DUENO' });
  });

  it('no deja confirmar a quien no es el receptor', () => {
    const jugada = jugarCarta(cartaDe(ANA), ANA, PAREJA, LUIS);
    if (!jugada.ok) throw new Error('setup');
    const r = confirmarCumplida(jugada.valor, ANA, estadoPuntosVacio());
    expect(r).toEqual({ ok: false, error: 'NO_ERES_RECEPTOR' });
  });

  it('al tercer punto de Ana se desbloquea 1 plot twist', () => {
    let estado = estadoPuntosVacio();
    for (let i = 0; i < 3; i++) {
      const jugada = jugarCarta(cartaDe(ANA), ANA, PAREJA, LUIS);
      if (!jugada.ok) throw new Error('setup');
      const cumplida = confirmarCumplida(jugada.valor, LUIS, estado);
      if (!cumplida.ok) throw new Error('cumplir');
      estado = cumplida.valor.estadoPuntos;
      if (i < 2) expect(cumplida.valor.plotTwistsNuevos).toBe(0);
      else expect(cumplida.valor.plotTwistsNuevos).toBe(1);
    }
    expect(estado.puntosPorUsuario[ANA]).toBe(3);
    expect(estado.plotTwistsPorUsuario[ANA]).toBe(1);
  });
});
