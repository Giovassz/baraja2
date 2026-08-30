// Muestra un avatar del catálogo estático (sección 4.5)
// Implementa BJ2-012
import Image from 'next/image';
import { obtenerAvatar } from '@/lib/reglas/avatares';

export function Avatar({
  avatarId,
  nombre,
  tamano = 56,
}: {
  avatarId: string | null | undefined;
  nombre?: string;
  tamano?: number;
}) {
  const avatar = obtenerAvatar(avatarId);
  return (
    <span
      className="inline-flex items-center justify-center overflow-hidden rounded-full ring-2 ring-white"
      style={{ width: tamano, height: tamano, backgroundColor: avatar.color }}
      title={nombre ?? avatar.nombre}
    >
      <Image
        src={avatar.archivo}
        alt={nombre ?? avatar.nombre}
        width={tamano}
        height={tamano}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
