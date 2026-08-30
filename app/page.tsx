// Landing / página web de Baraja2 — PWA instalable (estilo Spotify: web + app en el móvil)
// Implementa BJ2-002, BJ2-006
import Link from 'next/link';
import type { Metadata } from 'next';
import { crearClienteServidor } from '@/lib/supabase/server';
import { FondoCorazones } from '@/components/FondoCorazones';
import { NavLanding } from '@/components/landing/NavLanding';
import { Telefono } from '@/components/landing/Telefono';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';
import { Reveal } from '@/components/landing/Reveal';
import { BotonInstalar } from '@/components/pwa/BotonInstalar';
import { Icono, type LucideIcon } from '@/components/ui/iconos';

export const metadata: Metadata = {
  title: { absolute: 'Baraja2 — el juego de cartas semanal para su relación' },
  description:
    'Cada semana reciben 5 cartas para canjear retos y beneficios con su pareja. Suman puntos, desbloquean plot twists y juegan según su modalidad: a distancia, híbrida o presencial. Instálala en tu teléfono, gratis.',
  openGraph: {
    title: 'Baraja2 — el juego de cartas para su relación',
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

const PASOS: { icono: LucideIcon; titulo: string; texto: string }[] = [
  {
    icono: Icono.usuario,
    titulo: 'Crea tu cuenta',
    texto: 'Cada quien tiene la suya. Elige tu avatar y tu nombre.',
  },
  {
    icono: Icono.corazones,
    titulo: 'Vinculen su espacio',
    texto: 'Uno crea el espacio y comparte un código de 6 letras. El otro entra con él.',
  },
  {
    icono: Icono.mano,
    titulo: 'Reciben 5 cartas',
    texto: 'Cada semana, 5 retos nuevos por jugador según su modalidad de relación.',
  },
  {
    icono: Icono.chispa,
    titulo: 'Jueguen y desbloqueen',
    texto: 'Cumplan retos, sumen puntos y consigan plot twists para cambiar el juego.',
  },
];

const CARACTERISTICAS: { icono: LucideIcon; titulo: string; texto: string }[] = [
  {
    icono: Icono.avion,
    titulo: 'Tres modalidades',
    texto: 'A distancia, híbrida o presencial. Las cartas se adaptan a cómo viven su relación.',
  },
  {
    icono: Icono.chispa,
    titulo: 'Plot twists',
    texto: 'Bloquea o roba una carta de tu pareja. Cómpralos en la Tienda con tus puntos.',
  },
  {
    icono: Icono.espadas,
    titulo: 'Marcador semanal',
    texto: 'Compiten sanamente. El progreso sube su nivel de pareja.',
  },
  {
    icono: Icono.llama,
    titulo: 'Modo Spicy opcional',
    texto: 'Un extra para mayores de edad. Baraja2 nunca recibe ni guarda fotos.',
  },
  {
    icono: Icono.campana,
    titulo: 'Notificaciones',
    texto: 'Te avisa cuando tu pareja te juega una carta o cuando empieza la semana.',
  },
  {
    icono: Icono.reloj,
    titulo: 'Su historia juntos',
    texto: 'Cada carta cumplida y cada plot twist queda en su línea de tiempo.',
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Es gratis?',
    a: 'Sí. Baraja2 es gratis para jugar.',
  },
  {
    q: '¿Mi pareja necesita instalar algo?',
    a: 'Cada quien crea su cuenta en baraja2 y se vinculan con un código. Pueden usarlo desde el navegador o instalarlo en el teléfono, como prefieran.',
  },
  {
    q: '¿Guardan fotos o evidencias?',
    a: 'No. Baraja2 nunca recibe ni almacena fotos. Cualquier evidencia de un reto la comparten ustedes por fuera de la app.',
  },
  {
    q: '¿Cómo lo instalo en el celular?',
    a: 'Es una PWA: se instala desde esta misma web, sin pasar por ninguna tienda. En Android, tu navegador te ofrecerá "Instalar app". En iPhone: Compartir → Añadir a pantalla de inicio.',
  },
  {
    q: '¿Qué pasa si no cumplimos las cartas de la semana?',
    a: 'Las cartas no cumplidas expiran sin penalización. Cada semana empiezan de cero con 5 cartas nuevas.',
  },
];

export default async function LandingPage() {
  const autenticado = await haySesion();

  return (
    <div className="relative min-h-dvh">
      <FondoCorazones />
      <NavLanding autenticado={autenticado} />

      {/* HERO */}
      <section className="lp-seccion grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <Reveal>
          <span className="chip mb-4">
            <Icono.corazon className="h-3 w-3" strokeWidth={0} fill="currentColor" />
            Para parejas
          </span>
          <h1 className="font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
            Cada semana, <span className="text-rosa-acento">5 cartas</span> para vivir su
            relación jugando.
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/70">
            Baraja2 les reparte retos y beneficios cada semana. Cúmplanlos, sumen puntos y
            desbloqueen plot twists. Se adapta a si están cerca, lejos o a ratos.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={autenticado ? '/dashboard' : '/registro'} className="cta-grande">
              {autenticado ? 'Entrar a mi baraja' : 'Empezar gratis'}
              <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <BotonInstalar />
          </div>
          {!autenticado && (
            <p className="mt-3 text-sm text-white/45">
              ¿Ya tienen cuenta?{' '}
              <Link href="/login" className="font-semibold text-rosa-acento hover:underline">
                Inicia sesión
              </Link>
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1} className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-full bg-rosa-acento/20 blur-3xl" />
            <Telefono src="/capturas/casa.png" alt="Pantalla de inicio de Baraja2" />
          </div>
        </Reveal>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="lp-seccion py-14">
        <Reveal>
          <div className="banner-seccion mx-auto w-full max-w-[280px]">
            <Icono.jugar className="h-4 w-4" strokeWidth={2.6} />
            Cómo funciona
          </div>
          <h2 className="lp-titulo mt-5 text-center">De cero a jugando en 2 minutos</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => {
            const Ico = p.icono;
            return (
              <Reveal key={p.titulo} delay={i * 0.06}>
                <div className="lp-card h-full">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rosa-acento to-coral text-white">
                      <Ico className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <span className="font-heading text-xs font-bold text-white/40">
                      Paso {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-bold text-white">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-white/65">{p.texto}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="lp-seccion py-14">
        <Reveal>
          <div className="banner-seccion mx-auto w-full max-w-[280px]">
            <Icono.chispa className="h-4 w-4" strokeWidth={2.6} />
            Qué incluye
          </div>
          <h2 className="lp-titulo mt-5 text-center">Un juego que cambia cada semana</h2>
        </Reveal>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-4 sm:grid-cols-2">
            {CARACTERISTICAS.map((c, i) => {
              const Ico = c.icono;
              return (
                <Reveal key={c.titulo} delay={i * 0.05}>
                  <div className="lp-card h-full">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-rosa-acento">
                      <Ico className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h3 className="mt-3 font-heading text-base font-bold text-white">
                      {c.titulo}
                    </h3>
                    <p className="mt-1 text-sm text-white/65">{c.texto}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.1} className="hidden justify-center lg:flex">
            <Telefono src="/capturas/tienda.png" alt="Tienda de Baraja2" className="!w-[240px]" />
          </Reveal>
        </div>
      </section>

      {/* INSTALAR */}
      <section className="lp-seccion py-16">
        <Reveal>
          <div className="lp-card mx-auto max-w-3xl text-center">
            <span className="flex mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rosa-acento to-coral text-white">
              <Icono.bolsa className="h-7 w-7" strokeWidth={2} />
            </span>
            <h2 className="lp-titulo mt-4">Llévenla en el teléfono</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/70">
              Baraja2 es una app web: se instala desde aquí, sin tiendas ni descargas
              pesadas. Se abre a pantalla completa y funciona aunque haya poca señal.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <BotonInstalar />
              <Link
                href={autenticado ? '/dashboard' : '/registro'}
                className="text-sm font-semibold text-rosa-acento hover:underline"
              >
                {autenticado ? 'Abrir mi baraja →' : 'O empieza en el navegador →'}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="lp-seccion py-14">
        <Reveal>
          <h2 className="lp-titulo text-center">Preguntas frecuentes</h2>
        </Reveal>
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="lp-card group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-bold text-white">
                  {f.q}
                  <Icono.siguiente className="h-5 w-5 shrink-0 text-white/40 transition group-open:rotate-90" strokeWidth={2.5} />
                </summary>
                <p className="mt-3 text-sm text-white/65">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CIERRE */}
      <section className="lp-seccion py-16 text-center">
        <Reveal>
          <h2 className="lp-titulo mx-auto max-w-xl">
            Su relación, <span className="text-rosa-acento">su juego</span>.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={autenticado ? '/dashboard' : '/registro'} className="cta-grande">
              {autenticado ? 'Entrar a mi baraja' : 'Crear cuenta gratis'}
              <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="lp-seccion flex flex-col items-center justify-between gap-3 text-sm text-white/45 sm:flex-row">
          <div className="flex items-center gap-2">
            <LogoBaraja2 tamano={24} />
            <span className="font-heading font-bold text-white/70">Baraja2</span>
          </div>
          <p className="flex items-center gap-1.5">
            Hecho con
            <Icono.corazon className="h-3.5 w-3.5 text-rosa-acento" fill="currentColor" strokeWidth={0} />
            para parejas
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-white">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="hover:text-white">
              Crear cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
