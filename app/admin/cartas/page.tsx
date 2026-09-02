// Panel oculto: catálogo de cartas (sección 4.6), alternativa en vivo al script
// scripts/importar-catalogo.ts. Solo el/los correo(s) en ADMIN_EMAILS lo ven.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esCorreoAdmin } from '@/lib/admin';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono } from '@/components/ui/iconos';
import { PanelCatalogoCartas, type FilaCarta } from './PanelCatalogoCartas';

export const metadata = { title: 'Catálogo de cartas' };
export const dynamic = 'force-dynamic';

export default async function AdminCartasPage() {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) notFound();

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
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-3 p-4">
        <p className="widget !border-rosa-acento/40 text-sm text-rosa-acento">
          No se pudo leer el catálogo: {error.message}
        </p>
      </div>
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
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 p-4">
      <header className="flex items-center gap-3 pt-2">
        <Link
          href="/admin"
          className="rounded-full bg-white/10 p-2 text-white"
          aria-label="Volver al panel de testers"
        >
          <Icono.atras className="h-4 w-4" strokeWidth={2.5} />
        </Link>
        <span className="rounded-full bg-rosa-acento/15 p-2.5 text-rosa-acento">
          <Icono.mano className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-2xl">Catálogo de cartas</h1>
          <p className="text-sm text-white/60">
            Agrega cartas nuevas (una por línea) y quita las que ya no quieras que se
            repartan.
          </p>
        </div>
      </header>

      <PanelCatalogoCartas filas={filas} />
    </div>
  );
}
