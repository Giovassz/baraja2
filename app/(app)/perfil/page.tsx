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
import { SelectorAvatarPerfil } from '@/components/perfil/SelectorAvatarPerfil';
import { SelectorTema } from '@/components/perfil/SelectorTema';

export const metadata = { title: 'Perfil' };

export default async function PerfilPage() {
  const datos = await obtenerDatosPerfil();
  const vapidPublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
  const progresoPct = Math.round(datos.nivel.progreso * 100);

  return (
    <div className="flex flex-col gap-4">
      <TituloPagina icono={Icono.ajustes} subtitulo="Tú, su espacio y sus ajustes">
        Perfil
      </TituloPagina>

      {/* Tarjeta de jugador */}
      <section className="widget widget-lavanda flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <AnilloProgreso progreso={datos.nivel.progreso} tamano={80}>
            <SelectorAvatarPerfil
              nombre={datos.usuario.nombre}
              avatarId={datos.usuario.avatar_id}
              fotoUrl={datos.usuario.avatar_foto_url}
              tamano={56}
            />
          </AnilloProgreso>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-heading text-xl">{datos.usuario.nombre}</p>
              <span className="chip bg-rosa-acento/20 text-rosa-acento">
                <Icono.nivel className="h-3 w-3" strokeWidth={2.5} />
                Nivel {datos.nivel.nivel}
              </span>
              {datos.usuario.modo_tester && (
                <span className="chip bg-lavanda/20 text-lavanda">
                  <Icono.escudo className="h-3 w-3" strokeWidth={2.5} />
                  Tester
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/60">
              {datos.nivel.enNivel}/{datos.nivel.paraSubir} para subir de nivel
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rosa-acento to-[#ff7a59] transition-[width] duration-700 ease-out"
                style={{ width: `${progresoPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-center">
            <Icono.cumplida className="mx-auto h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
            <p className="mt-1 font-heading text-lg leading-none">
              {datos.totalCartasCumplidas}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
              Cumplidas
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-center">
            <Icono.chispa className="mx-auto h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
            <p className="mt-1 font-heading text-lg leading-none">
              {datos.totalPlotTwists}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
              Plot twists
            </p>
          </div>
        </div>
      </section>

      {/* Su espacio */}
      <section className="widget flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg">
          <Icono.corazones className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
          Su espacio
        </h2>

        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <Avatar
              avatarId={datos.pareja.yo.avatar_id}
              fotoUrl={datos.pareja.yo.avatar_foto_url}
              nombre={datos.pareja.yo.nombre}
              tamano={52}
            />
            <span className="max-w-[76px] truncate text-[11px] font-semibold text-white/70">
              {datos.pareja.yo.nombre}
            </span>
          </div>
          <Icono.corazon className="h-4 w-4 shrink-0 text-rosa-acento" strokeWidth={2.5} />
          <div className="flex flex-col items-center gap-1.5">
            {datos.pareja.companero ? (
              <>
                <Avatar
                  avatarId={datos.pareja.companero.avatar_id}
                  fotoUrl={datos.pareja.companero.avatar_foto_url}
                  nombre={datos.pareja.companero.nombre}
                  tamano={52}
                />
                <span className="max-w-[76px] truncate text-[11px] font-semibold text-white/70">
                  {datos.pareja.companero.nombre}
                </span>
              </>
            ) : (
              <div
                className="flex items-center justify-center rounded-full border border-dashed border-white/25 text-white/40"
                style={{ width: 52, height: 52 }}
              >
                <Icono.usuario className="h-5 w-5" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <span className="chip">{etiquetaModalidad(datos.pareja.modalidad)}</span>
        </div>

        <div className="border-t border-white/10 pt-3">
          <RenombrarEspacio nombreActual={datos.pareja.nombre_espacio ?? ''} />
        </div>
      </section>

      {/* Ajustes */}
      <div className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 px-1 text-lg">
          <Icono.ajustes className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
          Ajustes
        </h2>

        <div className="flex flex-col gap-3">
          <SelectorTema />

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
                <p className="text-xs text-white/60">
                  {datos.usuario.modo_spicy_activo ? 'Activo' : 'Desactivado'} · toca para
                  gestionar
                </p>
              </div>
            </div>
            <Icono.siguiente className="h-5 w-5 text-white/45" strokeWidth={2.5} />
          </Link>

          {/* Notificaciones */}
          <PanelNotificaciones vapidPublica={vapidPublica} preferencias={datos.preferencias} />
        </div>
      </div>

      {/* Cuenta / sesión */}
      <section className="widget flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-lg">
          <Icono.usuario className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
          Cuenta
        </h2>
        {datos.usuario.email && (
          <p className="flex items-center gap-2 text-sm text-white/70">
            <Icono.sobre className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span className="truncate">{datos.usuario.email}</span>
          </p>
        )}
        <form action={cerrarSesion}>
          <button className="boton-secundario w-full">
            <Icono.salir className="h-4 w-4" strokeWidth={2.5} />
            Cerrar sesión
          </button>
        </form>
      </section>
    </div>
  );
}
