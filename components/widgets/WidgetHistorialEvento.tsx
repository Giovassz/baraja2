// Fila de un evento del historial (sección 5 / Fase 8).
// Rediseño estilo lista de ranking (referencia: Preguntados): avatar de quien hizo
// la acción a la izquierda, texto + autor/fecha al centro, insignia del tipo de
// evento a la derecha — filas conectadas en una sola lista, no tarjetas sueltas.
// Tocar una fila abre el detalle (qué pasó, quién, cuándo y cuántos puntos).
// Implementa BJ2-045, BJ2-046
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { CartaJuego } from '@/components/ui/CartaJuego';
import { Icono, type LucideIcon } from '@/components/ui/iconos';
import { PUNTOS_POR_CARTA_CUMPLIDA } from '@/lib/reglas/constantes';
import type { TipoEventoHistorial } from '@/lib/supabase/tipos';

export interface EventoHistorialFila {
  tipoEvento: TipoEventoHistorial;
  descripcion: string;
  autor: string;
  avatarId: string | null;
  fotoUrl: string | null;
  fecha: string;
  /** La carta que el evento afectó — la cumplida, o la que un plot twist bloqueó/robó. */
  cartaAfectada: {
    texto: string;
    tipo: 'estandar' | 'spicy';
    puntosOtorgados: number;
    /** De quién era la carta (solo aplica a plot twists). */
    propietario: string | null;
  } | null;
}

const CONFIG: Record<
  TipoEventoHistorial,
  { icono: LucideIcon; etiqueta: string; clase: string }
> = {
  carta_cumplida: {
    icono: Icono.cumplida,
    etiqueta: 'Cumplida',
    clase: 'bg-menta/15 text-menta',
  },
  plot_twist_usado: {
    icono: Icono.chispa,
    etiqueta: 'Plot twist',
    clase: 'bg-rosa-acento/15 text-rosa-acento',
  },
};

function tiempoRelativo(fechaIso: string): string {
  const ahora = Date.now();
  const entonces = new Date(fechaIso).getTime();
  const minutos = Math.floor((ahora - entonces) / 60000);

  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  return new Date(fechaIso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function fechaCompleta(fechaIso: string): string {
  return new Date(fechaIso).toLocaleString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WidgetHistorialEvento({
  evento,
  ultimo = false,
}: {
  evento: EventoHistorialFila;
  ultimo?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const cfg = CONFIG[evento.tipoEvento];
  const Ico = cfg.icono;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`flex w-full items-center gap-3 bg-white/[0.02] px-4 py-3.5 text-left transition active:bg-white/[0.05] ${
          ultimo ? '' : 'border-b border-white/[0.06]'
        }`}
      >
        <Avatar
          avatarId={evento.avatarId}
          fotoUrl={evento.fotoUrl}
          nombre={evento.autor}
          tamano={40}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{evento.descripcion}</p>
          <p className="mt-0.5 truncate text-xs text-white/50">
            {evento.autor} · {tiempoRelativo(evento.fecha)}
          </p>
        </div>

        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.clase}`}
        >
          <Ico className="h-3 w-3" strokeWidth={2.5} />
          {cfg.etiqueta}
        </span>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-noche/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAbierto(false)}
          >
            <motion.div
              className="widget flex w-full max-w-md flex-col items-center gap-4 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white"
              >
                <Icono.cerrar className="h-4 w-4" strokeWidth={2.5} />
              </button>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.clase}`}
              >
                <Ico className="h-3 w-3" strokeWidth={2.5} />
                {cfg.etiqueta}
              </span>

              {evento.cartaAfectada ? (
                <>
                  {evento.tipoEvento === 'plot_twist_usado' && (
                    <p className="font-heading text-base text-white">
                      {evento.descripcion.split(':')[0]}
                    </p>
                  )}

                  <div className="w-full max-w-[200px]">
                    <CartaJuego
                      id="preview"
                      texto={evento.cartaAfectada.texto}
                      tipo={evento.cartaAfectada.tipo}
                      puntosOtorgados={evento.cartaAfectada.puntosOtorgados}
                      estado={
                        evento.tipoEvento === 'carta_cumplida'
                          ? 'cumplida'
                          : evento.descripcion.includes('robada')
                            ? 'robada'
                            : 'bloqueada'
                      }
                    />
                  </div>

                  {evento.tipoEvento === 'plot_twist_usado' && evento.cartaAfectada.propietario && (
                    <p className="text-sm text-white/70">
                      <span className="font-semibold text-white">{evento.autor}</span> le{' '}
                      {evento.descripcion.includes('robada') ? 'robó' : 'bloqueó'} esta carta a{' '}
                      <span className="font-semibold text-white">
                        {evento.cartaAfectada.propietario}
                      </span>
                      .
                    </p>
                  )}
                </>
              ) : (
                <p className="font-heading text-lg text-white">{evento.descripcion}</p>
              )}

              <div className="flex w-full items-center gap-3 rounded-widget border border-white/10 bg-white/[0.03] p-3">
                <Avatar
                  avatarId={evento.avatarId}
                  fotoUrl={evento.fotoUrl}
                  nombre={evento.autor}
                  tamano={40}
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-white">{evento.autor}</p>
                  <p className="truncate text-xs capitalize text-white/50">
                    {fechaCompleta(evento.fecha)}
                  </p>
                </div>
              </div>

              {evento.tipoEvento === 'carta_cumplida' && (
                <div className="flex w-full items-center justify-between rounded-widget bg-rosa-acento/10 p-3">
                  <span className="flex items-center gap-1.5 text-sm text-white/70">
                    <Icono.moneda className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
                    Puntos ganados
                  </span>
                  <span className="font-heading text-lg font-bold text-rosa-acento">
                    +{PUNTOS_POR_CARTA_CUMPLIDA}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
