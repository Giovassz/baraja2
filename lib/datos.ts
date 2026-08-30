// Lecturas de servidor reutilizables (Server Components). Las mutaciones viven en lib/actions/.
// Implementa BJ2-015, BJ2-022, BJ2-026, BJ2-045
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';
import { calcularCicloNumero } from '@/lib/reglas/ciclos';
import { nivelPareja, type EstadoNivel } from '@/lib/reglas/niveles';
import { PRECIO_PLOT_TWIST_TIENDA } from '@/lib/reglas/constantes';
import type { Fila, Modalidad } from '@/lib/supabase/tipos';

export interface UsuarioActual extends Fila<'usuarios'> {
  email: string | undefined;
}

/** Usuario autenticado + su perfil. Redirige a /login si no hay sesión. */
export const obtenerUsuarioActual = cache(async (): Promise<UsuarioActual> => {
  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!perfil) redirect('/login');

  return { ...perfil, email: user.email };
});

export interface ParejaConMiembros extends Fila<'parejas'> {
  cicloNumero: number;
  yo: Fila<'usuarios'>;
  companero: Fila<'usuarios'> | null;
}

/** Pareja del usuario actual, o null si aún no ha completado el onboarding. */
export const obtenerParejaActual = cache(async (): Promise<ParejaConMiembros | null> => {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  if (!usuario.pareja_id) return null;

  const { data: pareja } = await supabase
    .from('parejas')
    .select('*')
    .eq('id', usuario.pareja_id)
    .single();
  if (!pareja) return null;

  const { data: miembros } = await supabase
    .from('usuarios')
    .select('*')
    .eq('pareja_id', pareja.id);

  const yo = (miembros ?? []).find((m) => m.id === usuario.id) ?? usuario;
  const companero = (miembros ?? []).find((m) => m.id !== usuario.id) ?? null;

  return {
    ...pareja,
    cicloNumero: calcularCicloNumero(pareja.fecha_vinculacion),
    yo,
    companero,
  };
});

/** Exige que el onboarding esté completo; si no, redirige al paso que falta. */
export async function exigirParejaVinculada(): Promise<ParejaConMiembros> {
  const usuario = await obtenerUsuarioActual();
  const pareja = await obtenerParejaActual();

  if (!pareja) redirect('/vincular');
  if (!usuario.avatar_id) redirect('/avatar');
  if (!pareja.usuario_2_id) redirect('/vincular?esperando=1');

  return pareja;
}

export interface CartaConTexto extends Fila<'cartas_asignadas'> {
  texto: string;
  tipo: 'estandar' | 'spicy';
  puntosOtorgados: number;
}

export interface DatosDashboard {
  pareja: ParejaConMiembros;
  cicloNumero: number;
  misCartas: CartaConTexto[];
  cartasCompanero: CartaConTexto[];
  cartasRecibidas: CartaConTexto[];
  misPuntos: number;
  puntosCompanero: number;
  misPlotTwists: (Fila<'plot_twists_desbloqueados'> & {
    nombre: string;
    descripcion: string;
    efecto: string;
  })[];
  reloadUsado: boolean;
}

const MODALIDAD_ETIQUETA: Record<Modalidad, string> = {
  distancia: 'A distancia',
  hibrida: 'Híbrida',
  fisica: 'Presencial',
};

export function etiquetaModalidad(m: Modalidad): string {
  return MODALIDAD_ETIQUETA[m];
}

export async function obtenerDatosDashboard(): Promise<DatosDashboard> {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();
  const ciclo = pareja.cicloNumero;

  const [
    { data: asignadas },
    { data: catalogo },
    { data: puntos },
    { data: plotTwists },
    { data: catPlot },
    { data: reload },
  ] = await Promise.all([
    supabase
      .from('cartas_asignadas')
      .select('*')
      .eq('pareja_id', pareja.id)
      .eq('ciclo_numero', ciclo),
    supabase.from('catalogo_cartas').select('id, texto, tipo, puntos_otorgados'),
    supabase
      .from('puntos_semanales')
      .select('*')
      .eq('pareja_id', pareja.id)
      .eq('ciclo_numero', ciclo),
    supabase
      .from('plot_twists_desbloqueados')
      .select('*')
      .eq('usuario_id', usuario.id)
      .eq('ciclo_numero', ciclo),
    supabase.from('catalogo_plot_twists').select('id, nombre, descripcion, efecto'),
    supabase
      .from('reloads_usados')
      .select('id')
      .eq('usuario_id', usuario.id)
      .eq('ciclo_numero', ciclo)
      .maybeSingle(),
  ]);

  const textoDe = new Map((catalogo ?? []).map((c) => [c.id, c]));
  const plotDe = new Map((catPlot ?? []).map((p) => [p.id, p]));

  const conTexto = (c: Fila<'cartas_asignadas'>): CartaConTexto => {
    const cat = textoDe.get(c.carta_id);
    return {
      ...c,
      texto: cat?.texto ?? 'Carta',
      tipo: (cat?.tipo as 'estandar' | 'spicy') ?? 'estandar',
      puntosOtorgados: cat?.puntos_otorgados ?? 1,
    };
  };

  const todas = (asignadas ?? []).map(conTexto);
  const misCartas = todas.filter((c) => c.usuario_id === usuario.id);
  const cartasCompanero = todas.filter((c) => c.usuario_id !== usuario.id);
  const cartasRecibidas = todas.filter(
    (c) => c.jugada_hacia_usuario_id === usuario.id && c.estado === 'jugada',
  );

  const misPuntos = (puntos ?? []).find((p) => p.usuario_id === usuario.id)?.puntos ?? 0;
  const puntosCompanero =
    (puntos ?? []).find((p) => p.usuario_id !== usuario.id)?.puntos ?? 0;

  return {
    pareja,
    cicloNumero: ciclo,
    misCartas,
    cartasCompanero,
    cartasRecibidas,
    misPuntos,
    puntosCompanero,
    misPlotTwists: (plotTwists ?? []).map((pt) => {
      const cat = plotDe.get(pt.plot_twist_id);
      return {
        ...pt,
        nombre: cat?.nombre ?? 'Plot twist',
        descripcion: cat?.descripcion ?? '',
        efecto: cat?.efecto ?? 'otro',
      };
    }),
    reloadUsado: !!reload,
  };
}

// --- Chrome (barra superior) ----------------------------------------------

export interface ResumenChrome {
  nombreEspacio: string;
  nivel: EstadoNivel;
  puntos: number;
  cicloNumero: number;
}

export const obtenerResumenChrome = cache(async (): Promise<ResumenChrome> => {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();

  const [{ count: cumplidas }, { data: puntos }] = await Promise.all([
    supabase
      .from('historial_eventos')
      .select('*', { count: 'exact', head: true })
      .eq('pareja_id', pareja.id)
      .eq('tipo_evento', 'carta_cumplida'),
    supabase
      .from('puntos_semanales')
      .select('puntos')
      .eq('usuario_id', usuario.id)
      .eq('ciclo_numero', pareja.cicloNumero)
      .maybeSingle(),
  ]);

  return {
    nombreEspacio: pareja.nombre_espacio ?? 'Baraja2',
    nivel: nivelPareja(cumplidas ?? 0),
    puntos: puntos?.puntos ?? 0,
    cicloNumero: pareja.cicloNumero,
  };
});

// --- Tienda de plot twists ----------------------------------------------

export interface OpcionTienda {
  id: string;
  nombre: string;
  descripcion: string;
  efecto: 'bloquear_carta' | 'robar_carta' | 'otro';
  tipo: 'estandar' | 'spicy';
}

export interface DatosTienda {
  puntos: number;
  precio: number;
  opciones: OpcionTienda[];
  compradosEsteCiclo: number;
}

export async function obtenerDatosTienda(): Promise<DatosTienda> {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();

  const tipos: ('estandar' | 'spicy')[] = usuario.modo_spicy_activo
    ? ['estandar', 'spicy']
    : ['estandar'];

  const [{ data: catalogo }, { data: puntos }, { data: comprados }] = await Promise.all([
    supabase
      .from('catalogo_plot_twists')
      .select('id, nombre, descripcion, efecto, tipo')
      .eq('activo', true)
      .eq('modalidad', pareja.modalidad)
      .in('tipo', tipos),
    supabase
      .from('puntos_semanales')
      .select('puntos')
      .eq('usuario_id', usuario.id)
      .eq('ciclo_numero', pareja.cicloNumero)
      .maybeSingle(),
    supabase
      .from('plot_twists_desbloqueados')
      .select('id')
      .eq('usuario_id', usuario.id)
      .eq('ciclo_numero', pareja.cicloNumero),
  ]);

  return {
    puntos: puntos?.puntos ?? 0,
    precio: PRECIO_PLOT_TWIST_TIENDA,
    opciones: (catalogo ?? []) as OpcionTienda[],
    compradosEsteCiclo: (comprados ?? []).length,
  };
}

// --- Perfil -------------------------------------------------------------

export interface DatosPerfil {
  usuario: UsuarioActual;
  pareja: ParejaConMiembros;
  preferencias: { reset_semanal: boolean; carta_recibida: boolean };
  totalCartasCumplidas: number;
  totalPlotTwists: number;
  nivel: EstadoNivel;
}

export async function obtenerDatosPerfil(): Promise<DatosPerfil> {
  const supabase = crearClienteServidor();
  const usuario = await obtenerUsuarioActual();
  const pareja = await exigirParejaVinculada();

  const [{ data: pref }, { count: cumplidas }, { count: plotTwists }] = await Promise.all([
    supabase
      .from('preferencias_notificacion')
      .select('reset_semanal, carta_recibida')
      .eq('usuario_id', usuario.id)
      .maybeSingle(),
    supabase
      .from('historial_eventos')
      .select('*', { count: 'exact', head: true })
      .eq('pareja_id', pareja.id)
      .eq('tipo_evento', 'carta_cumplida'),
    supabase
      .from('historial_eventos')
      .select('*', { count: 'exact', head: true })
      .eq('pareja_id', pareja.id)
      .eq('tipo_evento', 'plot_twist_usado'),
  ]);

  return {
    usuario,
    pareja,
    preferencias: {
      reset_semanal: pref?.reset_semanal ?? true,
      carta_recibida: pref?.carta_recibida ?? true,
    },
    totalCartasCumplidas: cumplidas ?? 0,
    totalPlotTwists: plotTwists ?? 0,
    nivel: nivelPareja(cumplidas ?? 0),
  };
}
