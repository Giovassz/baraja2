// Logotipo de Baraja2: dos cartas cruzadas con corazón y llama (tono "picante").
// Implementa BJ2-002
import { Icono } from './iconos';

export function LogoBaraja2({ tamano = 40 }: { tamano?: number }) {
  const c = tamano * 0.62;
  const h = tamano * 0.86;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: tamano, height: tamano }}
      aria-hidden
    >
      <span
        className="absolute rounded-[5px] border border-white/70 bg-white shadow-widget-sm"
        style={{ width: c, height: h, transform: 'rotate(-14deg) translateX(-15%)' }}
      >
        <Icono.llama
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-rosa-acento"
          style={{ width: tamano * 0.3, height: tamano * 0.3 }}
          fill="currentColor"
          strokeWidth={0}
        />
      </span>
      <span
        className="absolute rounded-[5px] border border-white/70 bg-white shadow-widget-sm"
        style={{ width: c, height: h, transform: 'rotate(14deg) translateX(15%)' }}
      >
        <Icono.corazon
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-rosa-acento"
          style={{ width: tamano * 0.3, height: tamano * 0.3 }}
          fill="currentColor"
          strokeWidth={0}
        />
      </span>
    </span>
  );
}
