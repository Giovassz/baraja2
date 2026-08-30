// Constantes de negocio de Baraja2 (supuestos S1 y S2 del prompt maestro).
// Deben coincidir con las funciones puntos_por_carta_cumplida() y
// puntos_para_desbloquear_plot_twist() de supabase/migrations/20260101001300_rpc_mecanica.sql.
// Implementa BJ2-023

/** Puntos que otorga cumplir una carta estándar o spicy (supuesto S1). */
export const PUNTOS_POR_CARTA_CUMPLIDA = 1;

/** Puntos necesarios para desbloquear un plot twist (supuesto S2). Igual en las tres modalidades. */
export const PUNTOS_PARA_DESBLOQUEAR_PLOT_TWIST = 3;

/** Cartas estándar que recibe cada jugador al inicio de cada ciclo semanal. */
export const CARTAS_POR_CICLO = 5;

/** Duración de un ciclo en días (sección 4.1). */
export const DIAS_POR_CICLO = 7;

/** Máximo de reloads permitidos por ciclo (sección 4.8). */
export const RELOADS_POR_CICLO = 1;
