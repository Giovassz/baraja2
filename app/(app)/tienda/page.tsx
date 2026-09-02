// Tienda de plot twists — estructura estilo Clash Royale
// Función nueva pedida por el usuario.
import { obtenerDatosTienda } from '@/lib/datos';
import { presentacionPlotTwist } from '@/lib/reglas/carta';
import { Icono } from '@/components/ui/iconos';
import { BannerSeccion } from '@/components/ui/BannerSeccion';
import { IconoPrecio } from '@/components/ui/IconoPrecio';
import { PanelTienda } from './PanelTienda';
import { BotonBarajaNueva } from './BotonBarajaNueva';

export const metadata = { title: 'Tienda' };

export default async function TiendaPage() {
  const datos = await obtenerDatosTienda();

  return (
    <div className="flex flex-col gap-4">
      {datos.modoTester && (
        <div className="widget widget-acento !border-lavanda/40 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-lavanda/20 p-2 text-lavanda">
              <Icono.escudo className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div>
              <p className="font-heading text-sm text-lavanda">Modo tester activo</p>
              <p className="text-xs text-white/60">
                Compras aquí sin gastar puntos · recargas ilimitadas en Casa
              </p>
            </div>
          </div>
          <BotonBarajaNueva />
        </div>
      )}

      {/* HUD de recursos */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rosa-acento/15 p-1.5 text-rosa-acento">
            <Icono.tienda className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <h1 className="text-xl">Tienda</h1>
        </div>
        <span className={`precio-badge !text-base ${datos.modoTester ? 'animate-pulso-glow' : ''}`}>
          <IconoPrecio tamano={18} />
          {datos.modoTester ? '∞' : datos.puntos}
        </span>
      </div>

      {/* Sección plot twists */}
      <BannerSeccion
        icono={Icono.barajar}
        variante="morado"
        info={
          datos.modoTester
            ? 'Cuenta de prueba: comprar no gasta puntos'
            : `Cada plot twist cuesta ${datos.precio} puntos`
        }
      >
        Plot Twists
      </BannerSeccion>

      <PanelTienda
        puntos={datos.puntos}
        precio={datos.precio}
        opciones={datos.opciones}
        modoTester={datos.modoTester}
      />

      {/* Los que ya compraste este ciclo y todavía no usas — antes solo se veían en
          Casa, así que era fácil olvidar que ya tenías uno listo. */}
      {datos.misPlotTwistsDisponibles.length > 0 && (
        <>
          <BannerSeccion icono={Icono.gema} variante="morado">
            Tus plot twists
          </BannerSeccion>
          <div className="flex flex-col gap-2">
            {datos.misPlotTwistsDisponibles.map((pt) => {
              const pr = presentacionPlotTwist(pt.efecto);
              const Ico = Icono[pr.icono];
              return (
                <div
                  key={pt.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${pr.color}26`, color: pr.color }}
                  >
                    <Ico className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{pt.nombre}</p>
                    <p className="text-xs text-white/50">{pr.hint} · úsalo desde Casa</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Sección cómo ganar puntos */}
      <BannerSeccion icono={Icono.estrella} variante="oro">
        Cómo conseguir puntos
      </BannerSeccion>
      <div className="grid grid-cols-1 gap-2.5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span className="rounded-full bg-menta/15 p-2 text-menta">
            <Icono.cumplida className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <p className="text-sm text-white/80">
            Cumples un reto que te jugó tu pareja y ella lo confirma → <strong className="text-white">+1 punto</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span className="rounded-full bg-menta/15 p-2 text-menta">
            <Icono.llama className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <p className="text-sm text-white/80">
            Los retos Spicy también dan puntos al cumplirse.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span className="rounded-full bg-white/10 p-2 text-white/60">
            <Icono.reloj className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <p className="text-sm text-white/80">
            Los puntos se reinician cada semana — gástalos antes del lunes.
          </p>
        </div>
      </div>
    </div>
  );
}
