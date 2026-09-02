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
      <p className="widget !border-rosa-acento/40 text-sm text-rosa-acento">
        No se pudo leer la tabla de parejas: {error.message}
      </p>
    );
  }

  const nombrePorId = new Map((usuarios ?? []).map((u) => [u.id, u.nombre]));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3 pt-2 sm:pt-0">
        <span className="rounded-full bg-rosa-acento/15 p-2.5 text-rosa-acento sm:hidden">
          <Icono.corazones className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-2xl">Espacios</h1>
          <p className="text-sm text-white/60">
            Cada pareja vinculada, su modalidad y en qué semana van.
          </p>
        </div>
      </header>

      {(parejas ?? []).length === 0 ? (
        <p className="text-sm text-white/60">Todavía no hay espacios creados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {(parejas ?? []).map((p) => {
            const vinculada = !!p.usuario_2_id;
            const ciclo = calcularCicloNumero(p.fecha_vinculacion);
            return (
              <div key={p.id} className="widget !p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base">
                      {p.nombre_espacio ?? 'Sin nombre'}
                    </p>
                    <p className="mt-0.5 text-xs text-white/60">
                      {nombrePorId.get(p.usuario_1_id) ?? '—'}
                      {' + '}
                      {vinculada ? (nombrePorId.get(p.usuario_2_id!) ?? '—') : 'esperando pareja'}
                    </p>
                  </div>
                  <span
                    className={`chip shrink-0 ${
                      vinculada
                        ? '!bg-menta/15 !text-menta'
                        : '!bg-white/10 !text-white/50'
                    }`}
                  >
                    {vinculada ? 'Vinculada' : 'Incompleta'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="chip">
                    {MODALIDAD_ETIQUETA[p.modalidad] ?? p.modalidad}
                  </span>
                  {vinculada && <span className="chip">Semana {ciclo}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
