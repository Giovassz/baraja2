// Panel oculto: solo el/los correo(s) en ADMIN_EMAILS lo ven (los demás reciben un
// 404 normal, sin pista de que la ruta existe). Un solo dashboard con todo: números
// generales, testers y catálogo de cartas — entrar con ese correo cae directo aquí
// (ver iniciarSesion en lib/actions/auth.ts), sin tener que navegar a otra pantalla.
import { notFound } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esCorreoAdmin } from '@/lib/admin';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono, type LucideIcon } from '@/components/ui/iconos';
import { PanelAdminTesters, type FilaTester } from './PanelAdminTesters';
import { PanelCatalogoCartas, type FilaCarta } from './cartas/PanelCatalogoCartas';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const usuario = await obtenerUsuarioActual(); // exige sesión; redirige a /login si no hay
  if (!esCorreoAdmin(usuario.email)) notFound();

  const admin = crearClienteAdmin();

  const [
    { data: usuarios, error: errorUsuarios },
    { data: parejas },
    listaAuth,
    { count: totalUsuarios },
    { count: totalVinculadas },
    { count: totalCartasCatalogo },
    { count: totalCumplidas },
    { data: cartasCatalogo, error: errorCartas },
  ] = await Promise.all([
    admin
      .from('usuarios')
      .select('id, nombre, pareja_id, modo_tester')
      .order('created_at', { ascending: false }),
    admin.from('parejas').select('id, nombre_espacio'),
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('usuarios').select('*', { count: 'exact', head: true }),
    admin.from('parejas').select('*', { count: 'exact', head: true }).not('usuario_2_id', 'is', null),
    admin.from('catalogo_cartas').select('*', { count: 'exact', head: true }).eq('activo', true),
    admin
      .from('cartas_asignadas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'cumplida'),
    admin
      .from('catalogo_cartas')
      .select('id, texto, tipo, modalidad, puntos_otorgados')
      .eq('activo', true)
      .order('tipo')
      .order('modalidad')
      .order('created_at', { ascending: false }),
  ]);

  if (errorUsuarios) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-3 p-4">
        <p className="widget !border-rosa-acento/40 text-sm text-rosa-acento">
          No se pudo leer la tabla de usuarios: {errorUsuarios.message}
          {errorUsuarios.message.includes('modo_tester') && (
            <>
              {' '}
              — falta correr la migración{' '}
              <code className="font-mono">20260101002000_modo_tester.sql</code> en el SQL
              Editor de Supabase.
            </>
          )}
        </p>
      </div>
    );
  }

  const emailPorId = new Map(listaAuth.data.users.map((u) => [u.id, u.email ?? '—']));
  const espacioPorId = new Map((parejas ?? []).map((p) => [p.id, p.nombre_espacio]));

  const filasTesters: FilaTester[] = (usuarios ?? []).map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: emailPorId.get(u.id) ?? '—',
    modoTester: u.modo_tester,
    nombreEspacio: u.pareja_id ? (espacioPorId.get(u.pareja_id) ?? null) : null,
  }));

  const filasCartas: FilaCarta[] = errorCartas
    ? []
    : (cartasCatalogo ?? []).map((c) => ({
        id: c.id,
        texto: c.texto,
        tipo: c.tipo,
        modalidad: c.modalidad,
        puntos: c.puntos_otorgados,
      }));

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 p-4 pb-10">
      <header className="flex items-center gap-3 pt-2">
        <span className="rounded-full bg-rosa-acento/15 p-2.5 text-rosa-acento">
          <Icono.escudo className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-2xl">Panel de administración</h1>
          <p className="text-sm text-white/60">Solo tú ves esto.</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5">
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

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 px-1 text-lg">
          <Icono.escudo className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
          Testers
        </h2>
        {filasTesters.length === 0 ? (
          <p className="text-sm text-white/60">Todavía no hay cuentas registradas.</p>
        ) : (
          <PanelAdminTesters filas={filasTesters} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 px-1 text-lg">
          <Icono.mano className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
          Catálogo de cartas
        </h2>
        {errorCartas ? (
          <p className="widget !border-rosa-acento/40 text-sm text-rosa-acento">
            No se pudo leer el catálogo: {errorCartas.message}
          </p>
        ) : (
          <PanelCatalogoCartas filas={filasCartas} />
        )}
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
