// Ícono de puntos para los precios de la Tienda: una estrella en el color del tema
// activo — el mismo ícono que se usa para "puntos" en el resto de la app (antes era
// una moneda, luego una gema; ahora todo lo de puntos usa la estrella).
// Implementa BJ2-002
import { Icono } from './iconos';

export function IconoPrecio({ tamano = 16 }: { tamano?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-rosa-acento/15 text-rosa-acento"
      style={{ width: tamano, height: tamano }}
    >
      <Icono.estrella
        style={{ width: tamano * 0.62, height: tamano * 0.62 }}
        strokeWidth={2.5}
        fill="currentColor"
      />
    </span>
  );
}
