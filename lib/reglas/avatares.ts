// Catálogo estático de avatares (sección 4.5). No vive en base de datos.
// Los avatares definitivos (ilustraciones) se crearán después; por ahora cada uno
// se representa con un ícono-animal de lucide sobre un círculo de color de marca.
// Implementa BJ2-012
import type { NombreAnimal } from '@/components/ui/iconos';

export interface Avatar {
  id: string;
  nombre: string;
  /** Ícono-animal provisional (lucide). */
  icono: NombreAnimal;
  /** Color de fondo del círculo (paleta de marca). */
  color: string;
  /** Segundo color del degradado del círculo (mismo estilo, más carácter que un color plano). */
  colorSecundario: string;
  /** Ruta a la ilustración final cuando exista (opcional). */
  archivo?: string;
}

export const CATALOGO_AVATARES = [
  { id: 'gato-rosa', nombre: 'Gato rosa', icono: 'gato', color: '#F7A8C6', colorSecundario: '#E85D8A' },
  { id: 'perro-lavanda', nombre: 'Perro lavanda', icono: 'perro', color: '#D9C9EC', colorSecundario: '#8B6BB8' },
  { id: 'conejo-menta', nombre: 'Conejo menta', icono: 'conejo', color: '#BFEAD1', colorSecundario: '#3F9E74' },
  { id: 'ave-durazno', nombre: 'Ave durazno', icono: 'ave', color: '#FBD8C0', colorSecundario: '#E8794F' },
  { id: 'pez-cielo', nombre: 'Pez cielo', icono: 'pez', color: '#CDE7F0', colorSecundario: '#3E8EBF' },
  { id: 'ardilla-miel', nombre: 'Ardilla miel', icono: 'ardilla', color: '#F3E2B3', colorSecundario: '#C99A2E' },
  { id: 'tortuga-jade', nombre: 'Tortuga jade', icono: 'tortuga', color: '#BFE7D8', colorSecundario: '#2E8C6A' },
  { id: 'caracol-uva', nombre: 'Caracol uva', icono: 'caracol', color: '#E7D3F0', colorSecundario: '#9B5CC7' },
] as const satisfies readonly Avatar[];

export type AvatarId = (typeof CATALOGO_AVATARES)[number]['id'];

export const AVATAR_POR_DEFECTO: AvatarId = 'gato-rosa';

export function obtenerAvatar(id: string | null | undefined): Avatar {
  return (
    CATALOGO_AVATARES.find((a) => a.id === id) ??
    CATALOGO_AVATARES.find((a) => a.id === AVATAR_POR_DEFECTO)!
  );
}

export function esAvatarValido(id: string): id is AvatarId {
  return CATALOGO_AVATARES.some((a) => a.id === id);
}
