// Implementa BJ2-018..022 — un ciclo completo jugar -> reclamar -> confirmar -> sumar puntos (Fase 2)
import { describe, it, expect } from 'vitest';
import {
  jugarCarta,
  reclamarCumplida,
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
  it('Ana juega hacia Luis; Luis avisa que la cumplió; Ana confirma y Luis gana el punto', () => {
    let carta = cartaDe(ANA);

    const jugada = jugarCarta(carta, ANA, PAREJA, LUIS);
    expect(jugada.ok).toBe(true);
    if (!jugada.ok) return;
    carta = jugada.valor;
    expect(carta.estado).toBe('jugada');
    expect(carta.receptorId).toBe(LUIS);

    const reclamada = reclamarCumplida(carta, LUIS);
    expect(reclamada.ok).toBe(true);
    if (!reclamada.ok) return;
    carta = reclamada.valor;
    expect(carta.reclamada).toBe(true);

    const cumplida = confirmarCumplida(carta, ANA, estadoPuntosVacio());
    expect(cumplida.ok).toBe(true);
    if (!cumplida.ok) return;

    expect(cumplida.valor.carta.estado).toBe('cumplida');
    expect(cumplida.valor.usuarioQueGanoPuntos).toBe(LUIS);
    expect(cumplida.valor.estadoPuntos.puntosPorUsuario[LUIS]).toBe(1);
    expect(cumplida.valor.plotTwistsNuevos).toBe(0);
  });

  it('no deja que un tercero juegue la carta de Ana', () => {
    const r = jugarCarta(cartaDe(ANA), LUIS, PAREJA, ANA);
    expect(r).toEqual({ ok: false, error: 'NO_ERES_DUENO' });
  });

  it('no deja avisar "ya lo hice" a quien no es el receptor', () => {
    const jugada = jugarCarta(cartaDe(ANA), ANA, PAREJA, LUIS);
    if (!jugada.ok) throw new Error('setup');
    const r = reclamarCumplida(jugada.valor, ANA);
    expect(r).toEqual({ ok: false, error: 'NO_ERES_RECEPTOR' });
  });

  it('no deja confirmar a quien no mandó la carta', () => {
    const jugada = jugarCarta(cartaDe(ANA), ANA, PAREJA, LUIS);
    if (!jugada.ok) throw new Error('setup');
    const reclamada = reclamarCumplida(jugada.valor, LUIS);
    if (!reclamada.ok) throw new Error('setup');
    const r = confirmarCumplida(reclamada.valor, LUIS, estadoPuntosVacio());
    expect(r).toEqual({ ok: false, error: 'NO_ERES_QUIEN_LA_MANDO' });
  });

  it('no deja confirmar antes de que el receptor avise que la cumplió', () => {
    const jugada = jugarCarta(cartaDe(ANA), ANA, PAREJA, LUIS);
    if (!jugada.ok) throw new Error('setup');
    const r = confirmarCumplida(jugada.valor, ANA, estadoPuntosVacio());
    expect(r).toEqual({ ok: false, error: 'AUN_NO_RECLAMADA' });
  });

  it('al tercer punto de Luis se desbloquea 1 plot twist', () => {
    let estado = estadoPuntosVacio();
    for (let i = 0; i < 3; i++) {
      const jugada = jugarCarta(cartaDe(ANA), ANA, PAREJA, LUIS);
      if (!jugada.ok) throw new Error('setup');
      const reclamada = reclamarCumplida(jugada.valor, LUIS);
      if (!reclamada.ok) throw new Error('reclamar');
      const cumplida = confirmarCumplida(reclamada.valor, ANA, estado);
      if (!cumplida.ok) throw new Error('cumplir');
      estado = cumplida.valor.estadoPuntos;
      if (i < 2) expect(cumplida.valor.plotTwistsNuevos).toBe(0);
      else expect(cumplida.valor.plotTwistsNuevos).toBe(1);
    }
    expect(estado.puntosPorUsuario[LUIS]).toBe(3);
    expect(estado.plotTwistsPorUsuario[LUIS]).toBe(1);
  });
});
