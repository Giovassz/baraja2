// Muestra un avatar del catálogo estático (sección 4.5).
// Provisional: ícono-animal sobre círculo de color. Si algún día hay ilustración
// (avatar.archivo), se usa esa imagen.
// Implementa BJ2-012
import Image from 'next/image';
import { obtenerAvatar } from '@/lib/reglas/avatares';
import { ICONOS_ANIMAL } from '@/components/ui/iconos';

export function Avatar({
  avatarId,
  nombre,
  tamano = 56,
  anillo = true,
}: {
  avatarId: string | null | undefined;
  nombre?: string;
  tamano?: number;
  anillo?: boolean;
}) {
  const avatar = obtenerAvatar(avatarId);
  const IconoAnimal = ICONOS_ANIMAL[avatar.icono];

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full ${
        anillo ? 'ring-2 ring-white shadow-widget-sm' : ''
      }`}
      style={{ width: tamano, height: tamano, backgroundColor: avatar.color }}
      title={nombre ?? avatar.nombre}
    >
      {avatar.archivo ? (
        <Image
          src={avatar.archivo}
          alt={nombre ?? avatar.nombre}
          width={tamano}
          height={tamano}
          className="h-full w-full object-cover"
        />
      ) : (
        <IconoAnimal
          className="text-morado-marca"
          style={{ width: tamano * 0.52, height: tamano * 0.52 }}
          strokeWidth={2}
          aria-hidden
        />
      )}
    </span>
  );
}
