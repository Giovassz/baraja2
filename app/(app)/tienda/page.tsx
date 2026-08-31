// Tienda de plot twists — estructura estilo Clash Royale
// Función nueva pedida por el usuario.
import { obtenerDatosTienda } from '@/lib/datos';
import { Icono } from '@/components/ui/iconos';
import { BannerSeccion } from '@/components/ui/BannerSeccion';
import { PanelTienda } from './PanelTienda';

export const metadata = { title: 'Tienda' };

export default async function TiendaPage() {
  const datos = await obtenerDatosTienda();

  return (
    <div className="flex flex-col gap-4">
      {/* HUD de recursos */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rosa-acento/15 p-1.5 text-rosa-acento">
            <Icono.tienda className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <h1 className="text-xl">Tienda</h1>
        </div>
        <span className="precio-badge !text-base">
          <Icono.moneda className="h-4 w-4" strokeWidth={2.5} />
          {datos.puntos}
        </span>
      </div>

      {/* Sección plot twists */}
      <BannerSeccion icono={Icono.chispa} info={`Cada plot twist cuesta ${datos.precio} puntos`}>
        Plot Twists
      </BannerSeccion>

      <PanelTienda
        puntos={datos.puntos}
        precio={datos.precio}
        opciones={datos.opciones}
      />

      {/* Sección cómo ganar puntos */}
      <BannerSeccion icono={Icono.moneda}>Cómo conseguir puntos</BannerSeccion>
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
