// Catálogo de plot twists — mismo patrón que /admin/cartas. El layout de /admin ya
// exige ser correo admin.
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono } from '@/components/ui/iconos';
import { PanelPlotTwists, type FilaPlotTwist } from './PanelPlotTwists';

export const metadata = { title: 'Admin · Plot twists' };
export const dynamic = 'force-dynamic';

export default async function AdminPlotTwistsPage() {
  const admin = crearClienteAdmin();
  const { data: plotTwists, error } = await admin
    .from('catalogo_plot_twists')
    .select('id, nombre, descripcion, tipo, modalidad, efecto')
    .eq('activo', true)
    .order('modalidad')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <p className="widget !border-rosa-acento/40 text-sm text-rosa-acento">
        No se pudo leer el catálogo de plot twists: {error.message}
      </p>
    );
  }

  const filas: FilaPlotTwist[] = (plotTwists ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    tipo: p.tipo,
    modalidad: p.modalidad,
    efecto: p.efecto,
  }));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3 pt-2 sm:pt-0">
        <span className="rounded-full bg-rosa-acento/15 p-2.5 text-rosa-acento sm:hidden">
          <Icono.chispa className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-2xl">Plot twists</h1>
          <p className="text-sm text-white/60">
            Agrega, edita o quita los plot twists (comodines) del juego.
          </p>
        </div>
      </header>

      <PanelPlotTwists filas={filas} />
    </div>
  );
}
