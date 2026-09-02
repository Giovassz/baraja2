// Encabezado de sección: ícono + título + línea que se degrada, con una raya
// divisoria abajo. Antes era una píldora centrada con remaches — se veía genérica
// (plantilla de "app hecha con IA"); esto se siente más como una portada de sección
// de verdad, con su separación clara del contenido de abajo.
// Implementa BJ2-002
import type { LucideIcon } from './iconos';

const CLASE_VARIANTE = {
  rosa: 'banner-seccion--rosa',
  morado: 'banner-seccion--morado',
  oro: 'banner-seccion--oro',
} as const;

export function BannerSeccion({
  children,
  icono: Ico,
  info,
  variante = 'rosa',
}: {
  children: React.ReactNode;
  icono?: LucideIcon;
  info?: string;
  /** Rosa es el color de siempre; morado/oro sirven para distinguir secciones que no
   * deberían verse todas igual (p. ej. plot twists vs. puntos). */
  variante?: keyof typeof CLASE_VARIANTE;
}) {
  const clase = CLASE_VARIANTE[variante];
  return (
    <div className={`banner-seccion ${clase} flex flex-col gap-1.5`}>
      <div className="flex items-center gap-2.5">
        {Ico && (
          <span className="banner-seccion-icono flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
            <Ico className="h-3.5 w-3.5" strokeWidth={2.6} />
          </span>
        )}
        <span className="banner-seccion-titulo shrink-0 font-heading text-sm font-extrabold uppercase tracking-wider">
          {children}
        </span>
        <span className="banner-seccion-linea h-px flex-1" />
      </div>
      {info && <p className="text-[11px] font-semibold text-white/50">{info}</p>}
    </div>
  );
}
