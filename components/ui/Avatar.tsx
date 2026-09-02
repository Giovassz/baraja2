// Muestra el avatar de un jugador: su foto de perfil subida (si eligió una), o si no,
// un avatar del catálogo estático — ícono-animal sobre un círculo con degradado.
// Implementa BJ2-012, BJ2-042
import Image from 'next/image';
import { obtenerAvatar } from '@/lib/reglas/avatares';
import { ICONOS_ANIMAL } from '@/components/ui/iconos';

export function Avatar({
  avatarId,
  fotoUrl,
  nombre,
  tamano = 56,
  anillo = true,
}: {
  avatarId: string | null | undefined;
  /** Foto de perfil subida por el usuario — tiene prioridad sobre el avatar de catálogo. */
  fotoUrl?: string | null;
  nombre?: string;
  tamano?: number;
  anillo?: boolean;
}) {
  const claseBase = `inline-flex items-center justify-center overflow-hidden rounded-full ${
    anillo ? 'ring-2 ring-white shadow-widget-sm' : ''
  }`;

  if (fotoUrl) {
    return (
      <span
        className={claseBase}
        style={{ width: tamano, height: tamano }}
        title={nombre ?? 'Foto de perfil'}
      >
        <Image
          src={fotoUrl}
          alt={nombre ?? 'Foto de perfil'}
          width={tamano}
          height={tamano}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  const avatar = obtenerAvatar(avatarId);
  const IconoAnimal = ICONOS_ANIMAL[avatar.icono];

  return (
    <span
      className={claseBase}
      style={{
        width: tamano,
        height: tamano,
        background: `linear-gradient(145deg, ${avatar.color}, ${avatar.colorSecundario})`,
      }}
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
          className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
          style={{ width: tamano * 0.52, height: tamano * 0.52 }}
          strokeWidth={2}
          aria-hidden
        />
      )}
    </span>
  );
}
