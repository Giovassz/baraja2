// Gestión de usuarios del panel admin: activar/desactivar, modo tester, cambiar
// nombre, ver perfil completo y eliminar cuenta. El layout de /admin ya exige ser
// correo admin.
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { nivelPareja } from '@/lib/reglas/niveles';
import { Icono } from '@/components/ui/iconos';
import { PanelUsuarios, type FilaUsuario } from './PanelUsuarios';

export const metadata = { title: 'Admin · Usuarios' };
export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const admin = crearClienteAdmin();

  const [
    { data: usuarios, error: errorUsuarios },
    { data: parejas },
    listaAuth,
    { data: cartasAsignadas },
    { data: puntosSemanales },
    { data: plotTwistsDesbloqueados },
  ] = await Promise.all([
    admin
      .from('usuarios')
      .select('id, nombre, pareja_id, modo_tester, cuenta_activa, created_at')
      .order('created_at', { ascending: false }),
    admin.from('parejas').select('id, nombre_espacio, modalidad, usuario_1_id, usuario_2_id'),
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('cartas_asignadas').select('usuario_id, estado'),
    admin.from('puntos_semanales').select('usuario_id, puntos'),
    admin.from('plot_twists_desbloqueados').select('usuario_id, usado'),
  ]);

  if (errorUsuarios) {
    return (
      <p className="rounded-2xl border border-[var(--adm-bad)]/40 bg-[var(--adm-surface)] p-4 text-sm text-[var(--adm-bad)]">
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
  const espacioPorId = new Map((parejas ?? []).map((p) => [p.id, p]));

  const cumplidasPorUsuario = new Map<string, number>();
  for (const c of cartasAsignadas ?? []) {
    if (c.estado === 'cumplida') {
      cumplidasPorUsuario.set(c.usuario_id, (cumplidasPorUsuario.get(c.usuario_id) ?? 0) + 1);
    }
  }

  const puntosPorUsuario = new Map<string, number>();
  for (const p of puntosSemanales ?? []) {
    puntosPorUsuario.set(p.usuario_id, (puntosPorUsuario.get(p.usuario_id) ?? 0) + p.puntos);
  }

  const plotTwistsPorUsuario = new Map<string, { total: number; usados: number }>();
  for (const pt of plotTwistsDesbloqueados ?? []) {
    const actual = plotTwistsPorUsuario.get(pt.usuario_id) ?? { total: 0, usados: 0 };
    actual.total++;
    if (pt.usado) actual.usados++;
    plotTwistsPorUsuario.set(pt.usuario_id, actual);
  }

  const filas: FilaUsuario[] = (usuarios ?? []).map((u) => {
    const espacio = u.pareja_id ? espacioPorId.get(u.pareja_id) : undefined;
    const idCompanero = espacio
      ? espacio.usuario_1_id === u.id
        ? espacio.usuario_2_id
        : espacio.usuario_1_id
      : null;
    const nombreCompanero = idCompanero
      ? ((usuarios ?? []).find((otro) => otro.id === idCompanero)?.nombre ?? null)
      : null;

    return {
      id: u.id,
      nombre: u.nombre,
      email: emailPorId.get(u.id) ?? '—',
      modoTester: u.modo_tester,
      cuentaActiva: u.cuenta_activa,
      registradoEl: u.created_at,
      nombreEspacio: espacio?.nombre_espacio ?? null,
      modalidad: espacio?.modalidad ?? null,
      nombreCompanero,
      cartasCumplidas: cumplidasPorUsuario.get(u.id) ?? 0,
      puntosActuales: puntosPorUsuario.get(u.id) ?? 0,
      plotTwists: plotTwistsPorUsuario.get(u.id) ?? { total: 0, usados: 0 },
      nivel: nivelPareja(cumplidasPorUsuario.get(u.id) ?? 0).nivel,
    };
  });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <span className="rounded-full bg-[var(--adm-accent)]/15 p-2.5 text-[var(--adm-accent)]">
          <Icono.usuario className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-heading text-2xl text-[var(--adm-text)]">Usuarios</h1>
          <p className="text-sm text-[var(--adm-text-dim)]">
            Ver perfiles, activar/desactivar acceso, modo tester, cambiar nombre y eliminar
            cuentas.
          </p>
        </div>
      </header>

      {filas.length === 0 ? (
        <p className="text-sm text-[var(--adm-text-dim)]">Todavía no hay cuentas registradas.</p>
      ) : (
        <PanelUsuarios filas={filas} busquedaInicial={searchParams?.q ?? ''} />
      )}
    </div>
  );
}
