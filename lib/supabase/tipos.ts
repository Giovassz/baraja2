// Tipos de la base de datos de Baraja2, alineados con supabase/migrations/*.sql
// Implementa BJ2-003
// Nota: cuando exista el proyecto Supabase real, este archivo puede regenerarse con
//   npx supabase gen types typescript --linked > lib/supabase/tipos.ts
// Mientras tanto se mantiene a mano para que el tipado estricto funcione.

export type Modalidad = 'distancia' | 'hibrida' | 'fisica';
export type ModalidadCatalogo = Modalidad | 'todas';
export type TipoCarta = 'estandar' | 'spicy';
export type EstadoCarta =
  | 'disponible'
  | 'jugada'
  | 'cumplida'
  | 'bloqueada'
  | 'robada';
export type EfectoPlotTwist = 'bloquear_carta' | 'robar_carta' | 'otro';
export type TipoEventoHistorial = 'carta_cumplida' | 'plot_twist_usado';
export type TipoNotificacion = 'reset_semanal' | 'carta_recibida';
export type PlanSuscripcion = 'gratis' | 'plus';
export type EstadoSuscripcion = 'activa' | 'vencida' | 'cancelada';

type ConTimestamps<T> = T & { created_at: string };

interface UsuariosRow {
  id: string;
  nombre: string;
  avatar_id: string | null;
  confirmo_mayor_edad: boolean;
  pareja_id: string | null;
  modo_spicy_activo: boolean;
  created_at: string;
}

interface ParejasRow {
  id: string;
  nombre_espacio: string | null;
  modalidad: Modalidad;
  codigo_invitacion: string;
  codigo_usado: boolean;
  usuario_1_id: string;
  usuario_2_id: string | null;
  fecha_vinculacion: string | null;
  created_at: string;
}

interface CatalogoCartasRow {
  id: string;
  texto: string;
  tipo: TipoCarta;
  modalidad: ModalidadCatalogo;
  puntos_otorgados: number;
  activo: boolean;
  created_at: string;
}

interface CatalogoPlotTwistsRow {
  id: string;
  nombre: string;
  descripcion: string;
  efecto: EfectoPlotTwist;
  modalidad: Modalidad;
  tipo: TipoCarta;
  activo: boolean;
  created_at: string;
}

interface CartasAsignadasRow {
  id: string;
  usuario_id: string;
  pareja_id: string;
  carta_id: string;
  ciclo_numero: number;
  estado: EstadoCarta;
  jugada_hacia_usuario_id: string | null;
  fecha_asignacion: string;
  fecha_jugada: string | null;
  fecha_cumplida: string | null;
}

interface PlotTwistsDesbloqueadosRow {
  id: string;
  usuario_id: string;
  plot_twist_id: string;
  ciclo_numero: number;
  usado: boolean;
  carta_objetivo_id: string | null;
  fecha_desbloqueo: string;
  fecha_uso: string | null;
}

interface PuntosSemanalesRow {
  id: string;
  usuario_id: string;
  pareja_id: string;
  ciclo_numero: number;
  puntos: number;
}

interface ReloadsUsadosRow {
  id: string;
  usuario_id: string;
  ciclo_numero: number;
  usado_en: string;
}

interface HistorialEventosRow {
  id: string;
  pareja_id: string;
  usuario_id: string;
  tipo_evento: TipoEventoHistorial;
  referencia_id: string;
  descripcion: string;
  created_at: string;
}

interface NotificacionesRow {
  id: string;
  usuario_id: string;
  tipo: TipoNotificacion;
  leido: boolean;
  payload: Record<string, unknown> | null;
  created_at: string;
}

interface SuscripcionesRow {
  id: string;
  usuario_id: string;
  plan: PlanSuscripcion;
  estado: EstadoSuscripcion;
  fecha_inicio: string;
  fecha_renovacion: string | null;
  stripe_customer_id: string | null;
}

interface PushSuscripcionesRow {
  id: string;
  usuario_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

interface PreferenciasNotificacionRow {
  usuario_id: string;
  reset_semanal: boolean;
  carta_recibida: boolean;
  actualizado_en: string;
}

type TablaSimple<TRow, TGenerado extends keyof TRow> = {
  Row: TRow;
  Insert: Omit<TRow, TGenerado> & Partial<Pick<TRow, TGenerado>>;
  Update: Partial<TRow>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      usuarios: TablaSimple<
        UsuariosRow,
        'avatar_id' | 'confirmo_mayor_edad' | 'pareja_id' | 'modo_spicy_activo' | 'created_at'
      >;
      parejas: TablaSimple<
        ParejasRow,
        | 'id'
        | 'nombre_espacio'
        | 'codigo_usado'
        | 'usuario_2_id'
        | 'fecha_vinculacion'
        | 'created_at'
      >;
      catalogo_cartas: TablaSimple<
        CatalogoCartasRow,
        'id' | 'puntos_otorgados' | 'activo' | 'created_at'
      >;
      catalogo_plot_twists: TablaSimple<
        CatalogoPlotTwistsRow,
        'id' | 'activo' | 'created_at'
      >;
      cartas_asignadas: TablaSimple<
        CartasAsignadasRow,
        | 'id'
        | 'estado'
        | 'jugada_hacia_usuario_id'
        | 'fecha_asignacion'
        | 'fecha_jugada'
        | 'fecha_cumplida'
      >;
      plot_twists_desbloqueados: TablaSimple<
        PlotTwistsDesbloqueadosRow,
        'id' | 'usado' | 'carta_objetivo_id' | 'fecha_desbloqueo' | 'fecha_uso'
      >;
      puntos_semanales: TablaSimple<PuntosSemanalesRow, 'id' | 'puntos'>;
      reloads_usados: TablaSimple<ReloadsUsadosRow, 'id' | 'usado_en'>;
      historial_eventos: TablaSimple<HistorialEventosRow, 'id' | 'created_at'>;
      notificaciones: TablaSimple<
        NotificacionesRow,
        'id' | 'leido' | 'payload' | 'created_at'
      >;
      suscripciones: TablaSimple<
        SuscripcionesRow,
        'id' | 'plan' | 'estado' | 'fecha_inicio' | 'fecha_renovacion' | 'stripe_customer_id'
      >;
      push_suscripciones: TablaSimple<
        PushSuscripcionesRow,
        'id' | 'user_agent' | 'created_at'
      >;
      preferencias_notificacion: TablaSimple<
        PreferenciasNotificacionRow,
        'reset_semanal' | 'carta_recibida' | 'actualizado_en'
      >;
    };
    Views: Record<string, never>;
    Functions: {
      es_miembro_de_pareja: { Args: { p_pareja_id: string }; Returns: boolean };
      mi_pareja_id: { Args: Record<string, never>; Returns: string | null };
      ciclo_actual: { Args: { p_pareja_id: string }; Returns: number };
      vincular_con_codigo: { Args: { p_codigo: string }; Returns: string };
      jugar_carta: { Args: { p_carta_asignada_id: string }; Returns: undefined };
      confirmar_cumplida: { Args: { p_carta_asignada_id: string }; Returns: undefined };
      jugar_carta_spicy: { Args: { p_catalogo_carta_id: string }; Returns: string };
      usar_plot_twist_bloquear: {
        Args: { p_ptd_id: string; p_carta_objetivo_id: string };
        Returns: undefined;
      };
      usar_plot_twist_robar: {
        Args: { p_ptd_id: string; p_carta_objetivo_id: string };
        Returns: string;
      };
      recargar_cartas: { Args: Record<string, never>; Returns: number };
      reiniciar_ciclos_semanales: { Args: Record<string, never>; Returns: number };
      comprar_plot_twist: { Args: { p_catalogo_id: string }; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Fila<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insertar<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Actualizar<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type { ConTimestamps };
