// Catálogo de temas de color de la app (Perfil > Tema). Se guarda por dispositivo
// (localStorage), no por cuenta — ver app/layout.tsx (script que evita el parpadeo) y
// components/perfil/SelectorTema.tsx.
// Implementa BJ2-041

export interface Tema {
  valor: string;
  nombre: string;
  /** Color de muestra para el swatch — coincide con --c-acento de ese tema en globals.css. */
  vista: string;
}

export const CATALOGO_TEMAS: Tema[] = [
  { valor: 'rosado', nombre: 'Rosa', vista: '#E85D8A' },
  { valor: 'morado', nombre: 'Morado', vista: '#9B5CE8' },
  { valor: 'azul', nombre: 'Azul', vista: '#3E8EF7' },
  { valor: 'verde', nombre: 'Verde', vista: '#33B679' },
  { valor: 'rojo', nombre: 'Rojo', vista: '#E5484D' },
];

export const TEMA_POR_DEFECTO = 'rosado';
export const CLAVE_TEMA_LOCALSTORAGE = 'bj2-tema';

/** Evento que dispara SelectorTema al cambiar — ver components/ui/useTemaActivo.ts. */
export const EVENTO_CAMBIO_TEMA = 'bj2-tema-cambio';

// Ícono de celebración/acción principal por tema — antes siempre era el corazón sin
// importar el tema. No se tipa contra NombreIcono de components/ui/iconos para no
// hacer que lib/ dependa de components/; quien lo consume valida la clave.
export const ICONO_POR_TEMA: Record<string, string> = {
  rosado: 'corazon',
  morado: 'chispa',
  azul: 'luna',
  verde: 'flor',
  rojo: 'llama',
};
