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
  /** Ruta a la ilustración final cuando exista (opcional). */
  archivo?: string;
}

export const CATALOGO_AVATARES = [
  { id: 'gato-rosa', nombre: 'Gato rosa', icono: 'gato', color: '#F7C6DA' },
  { id: 'perro-lavanda', nombre: 'Perro lavanda', icono: 'perro', color: '#D9C9EC' },
  { id: 'conejo-menta', nombre: 'Conejo menta', icono: 'conejo', color: '#BFEAD1' },
  { id: 'ave-durazno', nombre: 'Ave durazno', icono: 'ave', color: '#FBD8C0' },
  { id: 'pez-cielo', nombre: 'Pez cielo', icono: 'pez', color: '#CDE7F0' },
  { id: 'ardilla-miel', nombre: 'Ardilla miel', icono: 'ardilla', color: '#F3E2B3' },
  { id: 'tortuga-jade', nombre: 'Tortuga jade', icono: 'tortuga', color: '#BFE7D8' },
  { id: 'caracol-uva', nombre: 'Caracol uva', icono: 'caracol', color: '#E7D3F0' },
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
