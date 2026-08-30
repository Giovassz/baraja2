// Catálogo estático de avatares (sección 4.5). No vive en base de datos.
// Las ilustraciones finales (SVG/PNG) las entrega el usuario en public/avatares/.
// Implementa BJ2-012

export interface Avatar {
  id: string;
  nombre: string;
  archivo: string;
  /** Color de respaldo mientras no exista el asset final (se usa como fondo del círculo). */
  color: string;
}

export const CATALOGO_AVATARES = [
  { id: 'oso-rosa', nombre: 'Oso rosa', archivo: '/avatares/oso-rosa.svg', color: '#F7C6DA' },
  { id: 'gato-lavanda', nombre: 'Gato lavanda', archivo: '/avatares/gato-lavanda.svg', color: '#D9C9EC' },
  { id: 'conejo-menta', nombre: 'Conejo menta', archivo: '/avatares/conejo-menta.svg', color: '#BFEAD1' },
  { id: 'zorro-durazno', nombre: 'Zorro durazno', archivo: '/avatares/zorro-durazno.svg', color: '#FBD8C0' },
  { id: 'panda-nube', nombre: 'Panda nube', archivo: '/avatares/panda-nube.svg', color: '#EDE7F6' },
  { id: 'pinguino-cielo', nombre: 'Pingüino cielo', archivo: '/avatares/pinguino-cielo.svg', color: '#CDE7F0' },
  { id: 'ciervo-miel', nombre: 'Ciervo miel', archivo: '/avatares/ciervo-miel.svg', color: '#F3E2B3' },
  { id: 'gato-fresa', nombre: 'Gato fresa', archivo: '/avatares/gato-fresa.svg', color: '#F6C6C6' },
] as const satisfies readonly Avatar[];

export type AvatarId = (typeof CATALOGO_AVATARES)[number]['id'];

export const AVATAR_POR_DEFECTO: AvatarId = 'oso-rosa';

export function obtenerAvatar(id: string | null | undefined): Avatar {
  return (
    CATALOGO_AVATARES.find((a) => a.id === id) ??
    CATALOGO_AVATARES.find((a) => a.id === AVATAR_POR_DEFECTO)!
  );
}

export function esAvatarValido(id: string): id is AvatarId {
  return CATALOGO_AVATARES.some((a) => a.id === id);
}
