// Catálogo de cartas (sección 4.6), alternativa en vivo al script
// scripts/importar-catalogo.ts. El layout de /admin ya exige ser correo admin.
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono } from '@/components/ui/iconos';
import { PanelCatalogoCartas, type FilaCarta } from './PanelCatalogoCartas';

export const metadata = { title: 'Admin · Cartas' };
export const dynamic = 'force-dynamic';

export default async function AdminCartasPage() {
  const admin = crearClienteAdmin();
  const { data: cartas, error } = await admin
    .from('catalogo_cartas')
    .select('id, texto, tipo, modalidad, puntos_otorgados')
    .eq('activo', true)
    .order('tipo')
    .order('modalidad')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <p className="rounded-2xl border border-[var(--adm-bad)]/40 bg-[var(--adm-surface)] p-4 text-sm text-[var(--adm-bad)]">
        No se pudo leer el catálogo: {error.message}
      </p>
    );
  }

  const filas: FilaCarta[] = (cartas ?? []).map((c) => ({
    id: c.id,
    texto: c.texto,
    tipo: c.tipo,
    modalidad: c.modalidad,
    puntos: c.puntos_otorgados,
  }));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <span className="rounded-full bg-[var(--adm-accent)]/15 p-2.5 text-[var(--adm-accent)]">
          <Icono.mano className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-heading text-2xl text-[var(--adm-text)]">Cartas</h1>
          <p className="text-sm text-[var(--adm-text-dim)]">
            Agrega, edita o quita las cartas que se reparten en el juego.
          </p>
        </div>
      </header>

      <PanelCatalogoCartas filas={filas} />
    </div>
  );
}
