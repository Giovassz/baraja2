// Bloque grande alternante (texto / mockup) estilo Tinder
import Link from 'next/link';
import { Reveal } from './Reveal';
import { Telefono } from './Telefono';
import { Icono } from '@/components/ui/iconos';

export function SeccionAlterna({
  numero,
  kicker,
  titulo,
  texto,
  cta,
  mockupSrc,
  mockupAlt,
  invertido = false,
}: {
  numero: string;
  kicker: string;
  titulo: React.ReactNode;
  texto: string;
  cta?: { href: string; label: string };
  mockupSrc: string;
  mockupAlt: string;
  invertido?: boolean;
}) {
  return (
    <div className="lp-seccion grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
      <Reveal className={invertido ? 'lg:order-2' : ''}>
        <span className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-rosa-acento">
          {numero} · {kicker}
        </span>
        <h2 className="lp-titulo mt-3 !text-4xl sm:!text-5xl">{titulo}</h2>
        <p className="mt-4 max-w-md text-lg text-white/70">{texto}</p>
        {cta && (
          <Link
            href={cta.href}
            className="mt-6 inline-flex items-center gap-1.5 font-heading font-bold text-rosa-acento hover:underline"
          >
            {cta.label}
            <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        )}
      </Reveal>

      <Reveal delay={0.1} className={`flex justify-center ${invertido ? 'lg:order-1' : ''}`}>
        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-full bg-rosa-acento/15 blur-3xl" />
          <Telefono src={mockupSrc} alt={mockupAlt} className="!w-[250px] sm:!w-[270px]" />
        </div>
      </Reveal>
    </div>
  );
}
