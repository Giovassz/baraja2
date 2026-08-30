// Mockup de teléfono con una captura real de la app
import Image from 'next/image';

export function Telefono({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`telefono ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={520}
        height={1126}
        className="block w-full"
        priority
      />
    </div>
  );
}
