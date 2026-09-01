// Esqueleto de carga genérico: se ve al instante al navegar (antes no había nada, así
// que tocar la barra inferior se sentía trabado mientras cargaban los datos).
export function EsqueletoPagina({ filas = 3 }: { filas?: number }) {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-hidden>
      <div className="mx-auto h-6 w-32 rounded-full bg-white/[0.06]" />
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="widget h-24 !bg-white/[0.04]" />
      ))}
    </div>
  );
}
