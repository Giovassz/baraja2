// Gestión de usuarios del panel admin: modo tester, cambiar nombre y eliminar
// cuenta. El layout de /admin ya exige ser correo admin.
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono } from '@/components/ui/iconos';
import { PanelUsuarios, type FilaUsuario } from './PanelUsuarios';

export const metadata = { title: 'Admin · Usuarios' };
export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  const admin = crearClienteAdmin();

  const [{ data: usuarios, error: errorUsuarios }, { data: parejas }, listaAuth] =
    await Promise.all([
      admin
        .from('usuarios')
        .select('id, nombre, pareja_id, modo_tester, cuenta_activa')
        .order('created_at', { ascending: false }),
      admin.from('parejas').select('id, nombre_espacio'),
      admin.auth.admin.listUsers({ perPage: 200 }),
    ]);

  if (errorUsuarios) {
    return (
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
        {errorUsuarios.message.includes('cuenta_activa') && (
          <>
            {' '}
            — falta correr la migración{' '}
            <code className="font-mono">20260101002600_cuenta_activa.sql</code> en el SQL
            Editor de Supabase.
          </>
        )}
      </p>
    );
  }

  const emailPorId = new Map(listaAuth.data.users.map((u) => [u.id, u.email ?? '—']));
  const espacioPorId = new Map((parejas ?? []).map((p) => [p.id, p.nombre_espacio]));

  const filas: FilaUsuario[] = (usuarios ?? []).map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: emailPorId.get(u.id) ?? '—',
    modoTester: u.modo_tester,
    cuentaActiva: u.cuenta_activa,
    nombreEspacio: u.pareja_id ? (espacioPorId.get(u.pareja_id) ?? null) : null,
  }));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3 pt-2 sm:pt-0">
        <span className="rounded-full bg-rosa-acento/15 p-2.5 text-rosa-acento sm:hidden">
          <Icono.usuario className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-2xl">Usuarios</h1>
          <p className="text-sm text-white/60">
            Activar/desactivar acceso, modo tester, cambiar nombre y eliminar cuentas.
          </p>
        </div>
      </header>

      {filas.length === 0 ? (
        <p className="text-sm text-white/60">Todavía no hay cuentas registradas.</p>
      ) : (
        <PanelUsuarios filas={filas} />
      )}
    </div>
  );
}
