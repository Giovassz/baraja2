// Panel oculto: solo el/los correo(s) en ADMIN_EMAILS lo ven (los demás reciben un
// 404 normal, sin pista de que la ruta existe). Deja activar "modo tester" por cuenta
// para cuentas de prueba (por ahora: recargas ilimitadas; más adelante puede saltarse
// otros límites sin tocar la base de datos otra vez).
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esCorreoAdmin } from '@/lib/admin';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono } from '@/components/ui/iconos';
import { PanelAdminTesters, type FilaTester } from './PanelAdminTesters';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const usuario = await obtenerUsuarioActual(); // exige sesión; redirige a /login si no hay
  if (!esCorreoAdmin(usuario.email)) notFound();

  const admin = crearClienteAdmin();

  const [{ data: usuarios, error: errorUsuarios }, { data: parejas }, listaAuth] =
    await Promise.all([
      admin
        .from('usuarios')
        .select('id, nombre, pareja_id, modo_tester')
        .order('created_at', { ascending: false }),
      admin.from('parejas').select('id, nombre_espacio'),
      admin.auth.admin.listUsers({ perPage: 200 }),
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

  const filas: FilaTester[] = (usuarios ?? []).map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: emailPorId.get(u.id) ?? '—',
    modoTester: u.modo_tester,
    nombreEspacio: u.pareja_id ? (espacioPorId.get(u.pareja_id) ?? null) : null,
  }));

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 p-4">
      <header className="flex items-center gap-3 pt-2">
        <span className="rounded-full bg-rosa-acento/15 p-2.5 text-rosa-acento">
          <Icono.escudo className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-2xl">Panel de testers</h1>
          <p className="text-sm text-white/60">
            Solo tú ves esto. Prende &ldquo;modo tester&rdquo; para saltar límites de
            juego — por ahora, recargas ilimitadas.
          </p>
        </div>
      </header>

      <Link
        href="/admin/cartas"
        className="widget widget-acento flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-rosa-acento/20 p-2 text-rosa-acento">
            <Icono.mano className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-heading text-base">Catálogo de cartas</p>
            <p className="text-xs text-white/60">Agregar o quitar cartas del juego</p>
          </div>
        </div>
        <Icono.siguiente className="h-5 w-5 text-white/45" strokeWidth={2.5} />
      </Link>

      {filas.length === 0 ? (
        <p className="text-sm text-white/60">Todavía no hay cuentas registradas.</p>
      ) : (
        <PanelAdminTesters filas={filas} />
      )}
    </div>
  );
}
