// Resumen del panel admin: números generales + crecimiento. Usuarios, Cartas, Plot
// twists y Espacios viven en sus propias pantallas (barra lateral) — este layout ya
// exige ser correo admin.
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

export const metadata = { title: 'Admin · Resumen' };
export const dynamic = 'force-dynamic';

const SEMANAS_A_MOSTRAR = 8;

export default async function AdminPage() {
  const admin = crearClienteAdmin();

  const [
    { count: totalUsuarios },
    { count: totalDesactivadas },
    { count: totalVinculadas },
    { count: totalCartasCatalogo },
    { count: totalPlotTwistsCatalogo },
    { count: totalCumplidas },
    { count: totalPlotTwistsUsados },
    { data: fechasUsuarios },
  ] = await Promise.all([
    admin.from('usuarios').select('*', { count: 'exact', head: true }),
    admin
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('cuenta_activa', false),
    admin
      .from('parejas')
      .select('*', { count: 'exact', head: true })
      .not('usuario_2_id', 'is', null),
    admin.from('catalogo_cartas').select('*', { count: 'exact', head: true }).eq('activo', true),
    admin
      .from('catalogo_plot_twists')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true),
    admin
      .from('cartas_asignadas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'cumplida'),
    admin
      .from('historial_eventos')
      .select('*', { count: 'exact', head: true })
      .eq('tipo_evento', 'plot_twist_usado'),
    admin.from('usuarios').select('created_at'),
  ]);

  const semanas = agruparPorSemana(
    (fechasUsuarios ?? []).map((u) => u.created_at),
    SEMANAS_A_MOSTRAR,
  );
  const maxSemana = Math.max(1, ...semanas.map((s) => s.total));
  const nuevosEstaSemana = semanas.at(-1)?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl text-[var(--adm-text)]">
          Bienvenido, este es tu panel de control.
        </h1>
        <p className="mt-1 text-sm text-[var(--adm-text-dim)]">
          Revisa usuarios, contenido y actividad de Baraja2 en un solo lugar.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <Estadistica icono={Icono.usuario} etiqueta="Usuarios" valor={totalUsuarios ?? 0} />
        <Estadistica
          icono={Icono.candado}
          etiqueta="Cuentas desactivadas"
          valor={totalDesactivadas ?? 0}
          tono={totalDesactivadas ? 'warn' : undefined}
        />
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
          icono={Icono.chispa}
          etiqueta="Plot twists en catálogo"
          valor={totalPlotTwistsCatalogo ?? 0}
        />
        <Estadistica
          icono={Icono.cumplida}
          etiqueta="Retos cumplidos"
          valor={totalCumplidas ?? 0}
          tono="good"
        />
        <Estadistica
          icono={Icono.chispa}
          etiqueta="Plot twists usados"
          valor={totalPlotTwistsUsados ?? 0}
        />
        <Estadistica
          icono={Icono.grafico}
          etiqueta="Nuevos esta semana"
          valor={nuevosEstaSemana}
          tono={nuevosEstaSemana > 0 ? 'good' : undefined}
        />
      </section>

      <section className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base text-[var(--adm-text)]">
              Crecimiento de usuarios
            </h2>
            <p className="text-xs text-[var(--adm-text-mute)]">
              Cuentas nuevas por semana, últimas {SEMANAS_A_MOSTRAR} semanas
            </p>
          </div>
        </div>

        <div className="mt-5 flex h-32 items-end gap-2 sm:gap-3">
          {semanas.map((s) => {
            const alturaPct = Math.round((s.total / maxSemana) * 100);
            return (
              <div key={s.etiqueta} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-24 w-full items-end">
                  <div
                    role="img"
                    aria-label={`Semana del ${s.etiqueta}: ${s.total} usuario(s) nuevo(s)`}
                    title={`${s.total} usuario(s) nuevo(s)`}
                    className="w-full rounded-t-[4px] bg-[var(--adm-accent)] transition-[height]"
                    style={{ height: `${Math.max(alturaPct, s.total > 0 ? 6 : 2)}%` }}
                  />
                </div>
                <span className="text-[9px] font-semibold text-[var(--adm-text-mute)]">
                  {s.etiqueta}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function agruparPorSemana(
  fechas: string[],
  semanas: number,
): { etiqueta: string; total: number }[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicioSemanaActual = new Date(hoy);
  inicioSemanaActual.setDate(hoy.getDate() - hoy.getDay());

  const cubetas: { inicio: Date; total: number }[] = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const inicio = new Date(inicioSemanaActual);
    inicio.setDate(inicioSemanaActual.getDate() - i * 7);
    cubetas.push({ inicio, total: 0 });
  }

  for (const f of fechas) {
    const fecha = new Date(f);
    for (let i = cubetas.length - 1; i >= 0; i--) {
      if (fecha >= cubetas[i]!.inicio) {
        cubetas[i]!.total++;
        break;
      }
    }
  }

  return cubetas.map((c) => ({
    etiqueta: c.inicio.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    total: c.total,
  }));
}

function Estadistica({
  icono: Ico,
  etiqueta,
  valor,
  tono,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: number;
  tono?: 'good' | 'warn';
}) {
  const colorValor =
    tono === 'good'
      ? 'text-[var(--adm-good)]'
      : tono === 'warn'
        ? 'text-[var(--adm-warn)]'
        : 'text-[var(--adm-text)]';
  return (
    <div className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--adm-text-mute)]">{etiqueta}</span>
        <Ico className="h-4 w-4 text-[var(--adm-text-mute)]" strokeWidth={2.2} />
      </div>
      <p className={`mt-2 font-heading text-2xl font-bold leading-none ${colorValor}`}>{valor}</p>
    </div>
  );
}
