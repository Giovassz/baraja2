// Información general de cada espacio/pareja — solo lectura. El layout de /admin ya
// exige ser correo admin.
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { calcularCicloNumero } from '@/lib/reglas/ciclos';
import { Icono } from '@/components/ui/iconos';

export const metadata = { title: 'Admin · Espacios' };
export const dynamic = 'force-dynamic';

const MODALIDAD_ETIQUETA: Record<string, string> = {
  distancia: 'A distancia',
  hibrida: 'Híbrida',
  fisica: 'Presencial',
};

export default async function AdminEspaciosPage() {
  const admin = crearClienteAdmin();

  const [{ data: parejas, error }, { data: usuarios }] = await Promise.all([
    admin
      .from('parejas')
      .select(
        'id, nombre_espacio, modalidad, usuario_1_id, usuario_2_id, fecha_vinculacion, created_at',
      )
      .order('created_at', { ascending: false }),
    admin.from('usuarios').select('id, nombre'),
  ]);

  if (error) {
    return (
      <p className="rounded-2xl border border-[var(--adm-bad)]/40 bg-[var(--adm-surface)] p-4 text-sm text-[var(--adm-bad)]">
        No se pudo leer la tabla de parejas: {error.message}
      </p>
    );
  }

  const nombrePorId = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));
  const total = (parejas ?? []).length;
  const vinculadas = (parejas ?? []).filter((p) => !!p.usuario_2_id).length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <span className="rounded-full bg-[var(--adm-accent)]/15 p-2.5 text-[var(--adm-accent)]">
          <Icono.corazones className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-heading text-2xl text-[var(--adm-text)]">Espacios</h1>
          <p className="text-sm text-[var(--adm-text-dim)]">
            Cada pareja vinculada, su modalidad y en qué semana van.
            {total > 0 && ` ${vinculadas} de ${total} vinculada(s).`}
          </p>
        </div>
      </header>

      {total === 0 ? (
        <p className="text-sm text-[var(--adm-text-dim)]">Todavía no hay espacios creados.</p>
      ) : (
        <div className="grid items-start gap-2 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {(parejas ?? []).map((p) => {
            const vinculada = !!p.usuario_2_id;
            const ciclo = calcularCicloNumero(p.fecha_vinculacion);
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base text-[var(--adm-text)]">
                      {p.nombre_espacio ?? 'Sin nombre'}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--adm-text-dim)]">
                      {nombrePorId.get(p.usuario_1_id) ?? '—'}
                      {' + '}
                      {vinculada ? (nombrePorId.get(p.usuario_2_id!) ?? '—') : 'esperando pareja'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      vinculada
                        ? 'bg-[var(--adm-good)]/15 text-[var(--adm-good)]'
                        : 'bg-[var(--adm-surface-2)] text-[var(--adm-text-mute)]'
                    }`}
                  >
                    {vinculada ? 'Vinculada' : 'Incompleta'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[var(--adm-surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--adm-text-dim)]">
                    {MODALIDAD_ETIQUETA[p.modalidad] ?? p.modalidad}
                  </span>
                  {vinculada && (
                    <span className="rounded-full bg-[var(--adm-surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--adm-text-dim)]">
                      Semana {ciclo}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
