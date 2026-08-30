// Tienda de plot twists: gasta tus puntos en el plot twist que quieras
// Función nueva pedida por el usuario.
import { obtenerDatosTienda } from '@/lib/datos';
import { TituloPagina } from '@/components/ui/EncabezadoPagina';
import { Icono } from '@/components/ui/iconos';
import { PanelTienda } from './PanelTienda';

export const metadata = { title: 'Tienda' };

export default async function TiendaPage() {
  const datos = await obtenerDatosTienda();

  return (
    <div className="flex flex-col gap-4">
      <TituloPagina
        icono={Icono.tienda}
        subtitulo="Compra plot twists con los puntos que ganas cumpliendo retos."
      >
        Tienda
      </TituloPagina>

      <div className="widget widget-acento flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-vino-marca">
            Tus puntos
          </p>
          <p className="flex items-center gap-2 font-heading text-3xl font-bold text-rosa-acento">
            <Icono.moneda className="h-6 w-6" strokeWidth={2.5} />
            {datos.puntos}
          </p>
        </div>
        <p className="max-w-[45%] text-right text-xs text-morado-marca/60">
          Cada plot twist cuesta {datos.precio} puntos.
        </p>
      </div>

      <PanelTienda
        puntos={datos.puntos}
        precio={datos.precio}
        opciones={datos.opciones}
      />
    </div>
  );
}
