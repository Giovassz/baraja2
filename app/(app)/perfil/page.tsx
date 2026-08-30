// Perfil / Configuración: tu cuenta, su espacio, modo Spicy, notificaciones y sesión.
// Cada persona tiene su propio perfil; el espacio (nombre/modalidad) es compartido.
// Implementa BJ2-013, BJ2-040
import Link from 'next/link';
import { obtenerDatosPerfil, etiquetaModalidad } from '@/lib/datos';
import { cerrarSesion } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/Avatar';
import { AnilloProgreso } from '@/components/ui/AnilloProgreso';
import { TituloPagina } from '@/components/ui/EncabezadoPagina';
import { Icono } from '@/components/ui/iconos';
import { PanelNotificaciones } from '../ajustes/notificaciones/PanelNotificaciones';
import { RenombrarEspacio } from './RenombrarEspacio';

export const metadata = { title: 'Perfil' };

export default async function PerfilPage() {
  const datos = await obtenerDatosPerfil();
  const vapidPublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

  return (
    <div className="flex flex-col gap-4">
      <TituloPagina icono={Icono.ajustes}>Perfil</TituloPagina>

      {/* Tarjeta de jugador */}
      <section className="widget widget-lavanda flex items-center gap-4">
        <AnilloProgreso progreso={datos.nivel.progreso} tamano={78}>
          <Avatar
            avatarId={datos.usuario.avatar_id}
            nombre={datos.usuario.nombre}
            tamano={52}
            anillo={false}
          />
        </AnilloProgreso>
        <div className="min-w-0">
          <p className="truncate font-heading text-xl">{datos.usuario.nombre}</p>
          <p className="flex items-center gap-1 text-sm text-vino-marca">
            <Icono.nivel className="h-3.5 w-3.5" strokeWidth={2.5} />
            Nivel {datos.nivel.nivel} · {datos.nivel.enNivel}/{datos.nivel.paraSubir} para subir
          </p>
          <p className="mt-1 flex gap-3 text-xs text-morado-marca/60">
            <span className="flex items-center gap-1">
              <Icono.cumplida className="h-3 w-3" strokeWidth={2.5} />
              {datos.totalCartasCumplidas} cumplidas
            </span>
            <span className="flex items-center gap-1">
              <Icono.chispa className="h-3 w-3" strokeWidth={2.5} />
              {datos.totalPlotTwists} plot twists
            </span>
          </p>
        </div>
      </section>

      {/* Su espacio */}
      <section className="widget flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-lg">
          <Icono.corazones className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
          Su espacio
        </h2>
        <p className="text-sm text-morado-marca/70">
          Modalidad: <strong>{etiquetaModalidad(datos.pareja.modalidad)}</strong>
          {datos.pareja.companero && (
            <>
              {' '}
              · con <strong>{datos.pareja.companero.nombre}</strong>
            </>
          )}
        </p>
        <RenombrarEspacio nombreActual={datos.pareja.nombre_espacio ?? ''} />
      </section>

      {/* Modo Spicy */}
      <Link
        href="/spicy"
        className="widget widget-acento flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-rosa-acento/20 p-2 text-rosa-acento">
            <Icono.llama className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-heading text-base">Modo Spicy</p>
            <p className="text-xs text-morado-marca/60">
              {datos.usuario.modo_spicy_activo ? 'Activo' : 'Desactivado'} · toca para gestionar
            </p>
          </div>
        </div>
        <Icono.siguiente className="h-5 w-5 text-morado-marca/40" strokeWidth={2.5} />
      </Link>

      {/* Notificaciones */}
      <section className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-lg">
          <Icono.campana className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
          Notificaciones
        </h2>
        <PanelNotificaciones vapidPublica={vapidPublica} preferencias={datos.preferencias} />
      </section>

      {/* Sesión */}
      <form action={cerrarSesion} className="pt-2">
        <button className="boton-secundario w-full">
          <Icono.salir className="h-4 w-4" strokeWidth={2.5} />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
