// Banner de sección estilo Clash Royale (píldora rosa con remaches)
// Implementa BJ2-002
import type { LucideIcon } from './iconos';

export function BannerSeccion({
  children,
  icono: Ico,
  info,
}: {
  children: React.ReactNode;
  icono?: LucideIcon;
  info?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="banner-seccion mx-auto w-full max-w-[280px]">
        {Ico && <Ico className="h-4 w-4" strokeWidth={2.6} />}
        {children}
      </div>
      {info && (
        <p className="text-center text-[11px] font-bold text-menta">{info}</p>
      )}
    </div>
  );
}
