// Resumen del panel admin: números generales. Usuarios y Cartas viven en sus
// propias pantallas (barra lateral) — este layout ya exige ser correo admin.
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

export const metadata = { title: 'Admin · Resumen' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = crearClienteAdmin();

  const [
    { count: totalUsuarios },
    { count: totalVinculadas },
    { count: totalCartasCatalogo },
    { count: totalCumplidas },
  ] = await Promise.all([
    admin.from('usuarios').select('*', { count: 'exact', head: true }),
    admin
      .from('parejas')
      .select('*', { count: 'exact', head: true })
      .not('usuario_2_id', 'is', null),
    admin.from('catalogo_cartas').select('*', { count: 'exact', head: true }).eq('activo', true),
    admin
      .from('cartas_asignadas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'cumplida'),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3 pt-2 sm:pt-0">
        <span className="rounded-full bg-rosa-acento/15 p-2.5 text-rosa-acento sm:hidden">
          <Icono.escudo className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-2xl">Resumen</h1>
          <p className="text-sm text-white/60">Solo tú ves esto.</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Estadistica icono={Icono.usuario} etiqueta="Usuarios" valor={totalUsuarios ?? 0} />
        <Estadistica
          icono={Icono.corazones}
          etiqueta="Parejas vinculadas"
          valor={totalVinculadas ?? 0}
        />
        <Estadistica
          icono={Icono.mano}
          etiqueta="Cartas en catálogo"
          valor={totalCartasCatalogo ?? 0}
        />
        <Estadistica
          icono={Icono.cumplida}
          etiqueta="Retos cumplidos"
          valor={totalCumplidas ?? 0}
        />
      </section>
    </div>
  );
}

function Estadistica({
  icono: Ico,
  etiqueta,
  valor,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: number;
}) {
  return (
    <div className="widget flex flex-col gap-1 !p-3.5">
      <Ico className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
      <p className="font-heading text-2xl font-bold leading-none">{valor}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
        {etiqueta}
      </p>
    </div>
  );
}
