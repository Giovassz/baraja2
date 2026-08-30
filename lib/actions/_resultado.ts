// Tipo de resultado compartido por todas las Server Actions
// Implementa BJ2-008

export interface ResultadoAccion {
  ok: boolean;
  /** Código de error tipado (p. ej. RELOAD_YA_USADO), para que la UI reaccione sin recargar. */
  error?: string;
  /** Mensaje legible en español para mostrar al usuario. */
  mensaje?: string;
}

export const exito = (mensaje?: string): ResultadoAccion => ({ ok: true, mensaje });

export const fallo = (error: string, mensaje?: string): ResultadoAccion => ({
  ok: false,
  error,
  mensaje: mensaje ?? mensajePorCodigo(error),
});

/** Traduce los códigos de error (de Postgres o de zod) a mensajes en español. */
export function mensajePorCodigo(codigo: string): string {
  const mapa: Record<string, string> = {
    SIN_SESION: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    NO_AUTENTICADO: 'Necesitas iniciar sesión.',
    DATOS_INVALIDOS: 'Revisa los datos e inténtalo de nuevo.',
    CODIGO_INVALIDO: 'Ese código de invitación no existe.',
    CODIGO_YA_USADO: 'Ese código ya fue utilizado por otra persona.',
    NO_PUEDES_UNIRTE_A_TU_PROPIO_ESPACIO: 'No puedes unirte a tu propio espacio.',
    YA_TIENES_PAREJA: 'Ya tienes un espacio vinculado.',
    CARTA_NO_ENCONTRADA: 'No encontramos esa carta.',
    NO_ERES_DUENO: 'Esa carta no es tuya.',
    CARTA_NO_DISPONIBLE: 'Esa carta ya no está disponible.',
    PAREJA_INCOMPLETA: 'Todavía falta que tu pareja se una.',
    NO_ERES_RECEPTOR: 'Solo quien recibió el reto puede confirmarlo.',
    CARTA_NO_JUGADA: 'Esa carta aún no se ha jugado.',
    PLOT_TWIST_NO_ENCONTRADO: 'No encontramos ese plot twist.',
    NO_ES_TU_PLOT_TWIST: 'Ese plot twist no es tuyo.',
    PLOT_TWIST_YA_USADO: 'Ya usaste ese plot twist.',
    CARTA_OBJETIVO_NO_ENCONTRADA: 'No encontramos la carta objetivo.',
    CARTA_FUERA_DE_TU_PAREJA: 'Esa carta no pertenece a tu espacio.',
    CARTA_OBJETIVO_NO_BLOQUEABLE: 'Solo puedes bloquear cartas disponibles.',
    CARTA_OBJETIVO_NO_ROBABLE: 'Solo puedes robar cartas disponibles.',
    NO_PUEDES_ROBARTE_A_TI_MISMO: 'No puedes robarte tu propia carta.',
    RELOAD_YA_USADO: 'Ya usaste tu reload de esta semana.',
    SIN_CARTAS_DISPONIBLES: 'No tienes cartas disponibles para recargar.',
    SIN_PAREJA: 'Primero completa la vinculación con tu pareja.',
    MENOR_DE_EDAD: 'El modo Spicy solo está disponible para personas mayores de edad.',
    ERROR_INESPERADO: 'Algo salió mal. Inténtalo de nuevo en un momento.',
  };
  return mapa[codigo] ?? mapa.ERROR_INESPERADO;
}

/** Extrae un código de error legible desde un error de Postgres/PostgREST. */
export function codigoDesdeError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message);
    const limpio = msg.replace(/^.*?:\s*/, '').trim();
    if (/^[A-Z_]{3,}$/.test(limpio)) return limpio;
  }
  return 'ERROR_INESPERADO';
}
