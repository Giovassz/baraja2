// Reglas puras sobre el uso de plot twists (sección 4.4). Testeable sin base de datos.
// Implementa BJ2-025
import type { EstadoCarta, EfectoPlotTwist } from '@/lib/supabase/tipos';

export interface CartaObjetivoMinima {
  id: string;
  pareja_id: string;
  usuario_id: string;
  estado: EstadoCarta;
}

export interface PlotTwistMinimo {
  id: string;
  usuario_id: string;
  usado: boolean;
  efecto: EfectoPlotTwist;
}

export type MotivoInvalido =
  | 'NO_ES_TU_PLOT_TWIST'
  | 'PLOT_TWIST_YA_USADO'
  | 'CARTA_FUERA_DE_TU_PAREJA'
  | 'CARTA_OBJETIVO_NO_DISPONIBLE'
  | 'NO_PUEDES_ROBARTE_A_TI_MISMO'
  | 'EFECTO_NO_SOPORTADO';

export interface Validacion {
  valido: boolean;
  motivo?: MotivoInvalido;
}

/**
 * Valida si un usuario puede usar un plot twist (bloquear o robar) sobre una carta.
 * Refleja las mismas comprobaciones que las funciones SQL usar_plot_twist_*.
 */
export function validarUsoPlotTwist(
  usuarioId: string,
  parejaIdDelUsuario: string,
  plotTwist: PlotTwistMinimo,
  carta: CartaObjetivoMinima,
): Validacion {
  if (plotTwist.usuario_id !== usuarioId) {
    return { valido: false, motivo: 'NO_ES_TU_PLOT_TWIST' };
  }
  if (plotTwist.usado) {
    return { valido: false, motivo: 'PLOT_TWIST_YA_USADO' };
  }
  if (carta.pareja_id !== parejaIdDelUsuario) {
    return { valido: false, motivo: 'CARTA_FUERA_DE_TU_PAREJA' };
  }
  if (carta.estado !== 'disponible') {
    return { valido: false, motivo: 'CARTA_OBJETIVO_NO_DISPONIBLE' };
  }
  if (plotTwist.efecto === 'robar_carta' && carta.usuario_id === usuarioId) {
    return { valido: false, motivo: 'NO_PUEDES_ROBARTE_A_TI_MISMO' };
  }
  if (plotTwist.efecto !== 'bloquear_carta' && plotTwist.efecto !== 'robar_carta') {
    return { valido: false, motivo: 'EFECTO_NO_SOPORTADO' };
  }
  return { valido: true };
}

/** Estado en que queda la carta objetivo original tras aplicar el plot twist. */
export function estadoResultante(efecto: EfectoPlotTwist): EstadoCarta {
  return efecto === 'robar_carta' ? 'robada' : 'bloqueada';
}
