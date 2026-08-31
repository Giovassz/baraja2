// Mockup de teléfono con una captura real de la app (escala proporcional)
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
      <Image src={src} alt={alt} fill sizes="280px" className="object-cover object-top" />
    </div>
  );
}
