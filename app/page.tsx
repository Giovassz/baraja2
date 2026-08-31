// Landing / página web de Baraja2 — diseño consistente y responsivo (mismo aspecto en cualquier pantalla).
// PWA instalable desde la misma web.
// Implementa BJ2-002, BJ2-006
import Link from 'next/link';
import type { Metadata } from 'next';
import { crearClienteServidor } from '@/lib/supabase/server';
import { FondoCorazones } from '@/components/FondoCorazones';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';
import { NavLanding } from '@/components/landing/NavLanding';
import { CartasHero } from '@/components/landing/CartasHero';
import { Telefono } from '@/components/landing/Telefono';
import { Reveal } from '@/components/landing/Reveal';
import { BotonInstalar } from '@/components/pwa/BotonInstalar';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

export const metadata: Metadata = {
  title: { absolute: 'Baraja2 — el juego de cartas semanal para su relación' },
  description:
    'Cada semana reciben 5 cartas para canjear retos y beneficios con su pareja. Suman puntos, desbloquean plot twists y juegan según su modalidad: a distancia, híbrida o presencial. Gratis, se instala en el teléfono.',
  openGraph: {
    title: 'Baraja2 — su relación, su juego',
    description: 'Cada semana, 5 cartas para vivir su relación jugando.',
    type: 'website',
  },
};

async function haySesion() {
  try {
    const supabase = crearClienteServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

const PASOS: { titulo: string; texto: string }[] = [
  { titulo: 'Creen su cuenta', texto: 'Cada quien la suya, con su nombre y su avatar.' },
  { titulo: 'Vinculen su espacio', texto: 'Uno comparte un código de 6 letras y el otro entra con él.' },
  { titulo: 'Reciben 5 cartas', texto: 'Cada semana, retos según su modalidad. Cúmplanlos y sumen puntos.' },
];

const INCLUYE: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: Icono.mano, titulo: '5 cartas por semana', texto: 'Retos y detalles nuevos cada lunes, distintos para cada quien.' },
  { icono: Icono.chispa, titulo: 'Plot twists y Tienda', texto: 'Bloquea o roba una carta de tu pareja. Cómpralos con tus puntos.' },
  { icono: Icono.espadas, titulo: 'Marcador y niveles', texto: 'Compiten sanamente y suben su nivel de pareja juntos.' },
  { icono: Icono.avion, titulo: 'Tres modalidades', texto: 'A distancia, híbrida o presencial: las cartas se adaptan.' },
  { icono: Icono.llama, titulo: 'Modo Spicy opcional', texto: 'Para mayores de edad. Nunca pedimos ni guardamos fotos.' },
  { icono: Icono.reloj, titulo: 'Su historia', texto: 'Cada carta cumplida y cada plot twist en su línea de tiempo.' },
];

const FAQS: { q: string; a: string }[] = [
  { q: '¿Es gratis?', a: 'Sí, Baraja2 es gratis para jugar.' },
  {
    q: '¿Mi pareja necesita instalar algo?',
    a: 'Cada quien crea su cuenta y se vinculan con un código. Pueden usarlo desde el navegador o instalarlo en el teléfono, como prefieran.',
  },
  {
    q: '¿Guardan fotos o evidencias?',
    a: 'No. Baraja2 nunca recibe ni almacena fotos. Cualquier evidencia de un reto la comparten ustedes por fuera, como quieran.',
  },
  {
    q: '¿Cómo lo instalo en el celular?',
    a: 'Es una app web: se instala desde esta misma página, sin tiendas. En Android tu navegador ofrece “Instalar app”; en iPhone, Compartir → Añadir a pantalla de inicio.',
  },
  {
    q: '¿Y si no cumplimos las cartas de la semana?',
    a: 'Expiran sin penalización. Cada semana empiezan de cero con 5 cartas nuevas.',
  },
];

export default async function LandingPage() {
  const autenticado = await haySesion();
  const irApp = autenticado ? '/dashboard' : '/registro';

  return (
    <div className="relative [overflow-x:clip]">
      <NavLanding autenticado={autenticado} />

      {/* HERO */}
      <section className="relative">
        <div className="hero-fondo" />
        <FondoCorazones />
        <div className="lp grid items-center gap-10 py-12 sm:py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.75rem] font-bold uppercase tracking-wider text-white/85">
              <Icono.corazon className="h-3 w-3" strokeWidth={0} fill="currentColor" />
              Para parejas · gratis
            </span>
            <h1 className="lp-display mt-5">
              Su relación,
              <br />
              <span className="texto-degradado">su juego.</span>
            </h1>
            <p className="lp-lead mt-5 max-w-md">
              Cada semana, 5 cartas para retarse, consentirse y desbloquear plot twists.
              Cerca, lejos o a ratos: Baraja2 se adapta a ustedes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={irApp} className="cta-grande">
                {autenticado ? 'Entrar a mi baraja' : 'Crear cuenta'}
                <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <BotonInstalar />
            </div>
            {!autenticado && (
              <p className="mt-4 text-sm text-white/50">
                ¿Ya juegan?{' '}
                <Link href="/login" className="font-bold text-white hover:underline">
                  Inicia sesión
                </Link>
              </p>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <CartasHero />
          </Reveal>
        </div>
      </section>

      {/* TIRA DE CONFIANZA */}
      <div className="border-y border-white/10 bg-white/[0.03]">
        <div className="lp flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3.5 text-[0.8rem] font-bold text-white/55">
          <span className="flex items-center gap-1.5">
            <Icono.check className="h-4 w-4 text-menta" strokeWidth={3} /> 100% gratis
          </span>
          <span className="flex items-center gap-1.5">
            <Icono.check className="h-4 w-4 text-menta" strokeWidth={3} /> 3 modalidades
          </span>
          <span className="flex items-center gap-1.5">
            <Icono.check className="h-4 w-4 text-menta" strokeWidth={3} /> Nunca guardamos fotos
          </span>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section className="lp lp-seccion">
        <Reveal>
          <p className="lp-eyebrow">Cómo empieza</p>
          <h2 className="lp-h2 mt-2 max-w-2xl">De cero a jugando en dos minutos</h2>
        </Reveal>
        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {PASOS.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.08}>
              <li className="lp-card h-full">
                <span className="font-heading text-2xl font-extrabold text-rosa-acento">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-heading text-lg font-bold text-white">{p.titulo}</h3>
                <p className="mt-1 text-sm text-white/60">{p.texto}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* SHOWCASE */}
      <section className="lp lp-seccion border-t border-white/10">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <Reveal>
            <Telefono src="/capturas/casa.png" alt="La pantalla de inicio de Baraja2" />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="lp-eyebrow">Qué incluye</p>
            <h2 className="lp-h2 mt-2">Un juego que cambia cada semana</h2>
            <ul className="mt-6 space-y-4">
              {INCLUYE.map((c) => {
                const Ico = c.icono;
                return (
                  <li key={c.titulo} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-rosa-acento">
                      <Ico className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="font-heading text-[0.95rem] font-bold text-white">{c.titulo}</p>
                      <p className="text-sm text-white/60">{c.texto}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* INSTALAR */}
      <section className="lp lp-seccion border-t border-white/10">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="lp-eyebrow">En tu teléfono</p>
            <h2 className="lp-h2 mt-2">Llévenla como app, sin tiendas</h2>
            <p className="lp-lead mx-auto mt-3 max-w-lg">
              Baraja2 se instala desde esta misma página. Se abre a pantalla completa, con su
              ícono, y funciona aunque haya poca señal.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto mt-9 grid max-w-2xl gap-4 sm:grid-cols-3">
          {[
            { n: '1', t: 'Abre baraja2 en tu navegador' },
            { n: '2', t: 'Toca “Instalar” o “Añadir a inicio”' },
            { n: '3', t: 'Ábrela desde tu pantalla de inicio' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div className="lp-card h-full items-center text-center">
                <span className="font-heading text-xl font-extrabold text-white/25">{s.n}</span>
                <p className="mt-1 text-sm text-white/70">{s.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <BotonInstalar />
            <Link href={irApp} className="text-sm font-bold text-white/80 hover:text-white">
              {autenticado ? 'Abrir mi baraja →' : 'O empieza en el navegador →'}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="lp lp-seccion border-t border-white/10">
        <Reveal>
          <p className="lp-eyebrow text-center">Dudas</p>
          <h2 className="lp-h2 mt-2 text-center">Preguntas frecuentes</h2>
        </Reveal>
        <div className="mx-auto mt-9 max-w-2xl space-y-2.5">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="lp-card group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-[0.95rem] font-bold text-white">
                  {f.q}
                  <Icono.siguiente
                    className="h-5 w-5 shrink-0 text-white/40 transition group-open:rotate-90"
                    strokeWidth={2.5}
                  />
                </summary>
                <p className="mt-3 text-sm text-white/60">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CIERRE */}
      <section className="relative border-t border-white/10">
        <div className="hero-fondo" />
        <div className="lp lp-seccion text-center">
          <Reveal>
            <h2 className="lp-display">
              Empiecen a <span className="texto-degradado">jugar</span>
            </h2>
            <p className="lp-lead mx-auto mt-3 max-w-sm">5 cartas los esperan esta semana.</p>
            <Link href={irApp} className="cta-grande mt-7 !px-8 !py-3.5 !text-base">
              {autenticado ? 'Entrar a mi baraja' : 'Crear cuenta gratis'}
              <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-noche">
        <div className="lp grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <LogoBaraja2 tamano={24} />
              <span className="font-heading text-[1.05rem] font-extrabold text-white">Baraja2</span>
            </div>
            <p className="mt-3 text-sm text-white/50">
              El juego de cartas semanal para vivir su relación jugando.
            </p>
          </div>
          <FooterCol titulo="Producto">
            <FooterLink href="/registro">Crear cuenta</FooterLink>
            <FooterLink href="/login">Iniciar sesión</FooterLink>
            <FooterLink href={irApp}>Abrir la app</FooterLink>
          </FooterCol>
          <FooterCol titulo="Privacidad">
            <li>Nunca recibimos ni guardamos fotos</li>
            <li>Solo ustedes ven sus cartas</li>
            <li>Mayoría de edad para el modo Spicy</li>
          </FooterCol>
          <FooterCol titulo="Instalar">
            <li>Desde la web, sin tiendas</li>
            <li>Android: menú → Instalar app</li>
            <li>iPhone: Compartir → Añadir a inicio</li>
          </FooterCol>
        </div>
        <div className="lp flex flex-col items-center justify-between gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Baraja2</p>
          <p className="flex items-center gap-1.5">
            Hecho con
            <Icono.corazon className="h-3.5 w-3.5 text-rosa-acento" fill="currentColor" strokeWidth={0} />
            para parejas
          </p>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-heading text-[0.7rem] font-bold uppercase tracking-widest text-white/40">
        {titulo}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-white/60">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition hover:text-white">
        {children}
      </Link>
    </li>
  );
}
