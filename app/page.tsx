// Landing / página web de Baraja2 — estructura estilo Tinder (audaz, animada), tono amoroso y con picardía.
// PWA instalable desde la misma web (como Spotify).
// Implementa BJ2-002, BJ2-006
import Link from 'next/link';
import type { Metadata } from 'next';
import { crearClienteServidor } from '@/lib/supabase/server';
import { FondoCorazones } from '@/components/FondoCorazones';
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';
import { NavLanding } from '@/components/landing/NavLanding';
import { CartasHero } from '@/components/landing/CartasHero';
import { SeccionAlterna } from '@/components/landing/SeccionAlterna';
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

const PASOS: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: Icono.usuario, titulo: 'Crea tu cuenta', texto: 'Cada quien la suya. Elige avatar y nombre.' },
  { icono: Icono.corazones, titulo: 'Vinculen su espacio', texto: 'Uno comparte un código de 6 letras, el otro entra.' },
  { icono: Icono.mano, titulo: 'Reciben 5 cartas', texto: 'Cada semana, retos según su modalidad de relación.' },
  { icono: Icono.chispa, titulo: 'Jueguen y desbloqueen', texto: 'Cumplan, sumen puntos y consigan plot twists.' },
];

const EXTRAS: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: Icono.espadas, titulo: 'Marcador y niveles', texto: 'Compiten sanamente y suben su nivel de pareja.' },
  { icono: Icono.campana, titulo: 'Notificaciones', texto: 'Te avisa cuando te juegan una carta o empieza la semana.' },
  { icono: Icono.reloj, titulo: 'Su historia', texto: 'Cada carta cumplida y cada plot twist, en su línea de tiempo.' },
];

const FAQS: { q: string; a: string }[] = [
  { q: '¿Es gratis?', a: 'Sí. Baraja2 es gratis para jugar.' },
  {
    q: '¿Mi pareja necesita instalar algo?',
    a: 'Cada quien crea su cuenta y se vinculan con un código. Pueden usarlo desde el navegador o instalarlo en el teléfono, como prefieran.',
  },
  {
    q: '¿Guardan fotos o evidencias?',
    a: 'No. Baraja2 nunca recibe ni almacena fotos. Cualquier evidencia de un reto la comparten ustedes por fuera de la app, como quieran.',
  },
  {
    q: '¿Cómo lo instalo en el celular?',
    a: 'Es una PWA: se instala desde esta misma web, sin pasar por ninguna tienda. En Android tu navegador te ofrece "Instalar app". En iPhone: Compartir → Añadir a pantalla de inicio.',
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

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[calc(100dvh-64px)] items-center">
        <div className="hero-fondo" />
        <FondoCorazones />
        <div className="lp-seccion grid items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <span className="chip mb-5 !bg-white/15 !text-white">
              <Icono.corazon className="h-3 w-3" strokeWidth={0} fill="currentColor" />
              Para parejas · gratis
            </span>
            <h1 className="lp-mega">
              Su relación,
              <br />
              <span className="texto-degradado">su juego.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/75 sm:text-xl">
              Cada semana, 5 cartas para retarse, consentirse y desbloquear plot twists.
              Cerca, lejos o a ratos: Baraja2 se adapta a ustedes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={irApp} className="cta-grande !px-8 !py-4 !text-lg">
                {autenticado ? 'Entrar a mi baraja' : 'Crear cuenta'}
                <Icono.flecha className="h-5 w-5" strokeWidth={2.5} />
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

          <Reveal delay={0.12} className="flex justify-center">
            <CartasHero />
          </Reveal>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <Icono.siguiente className="h-6 w-6 rotate-90 animate-bounce text-white/40" strokeWidth={2.5} />
        </div>
      </section>

      {/* ===== FRANJA ===== */}
      <div className="border-y border-white/10 bg-white/[0.03]">
        <div className="lp-seccion flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 text-sm font-bold text-white/55">
          <span className="flex items-center gap-1.5">
            <Icono.check className="h-4 w-4 text-menta" strokeWidth={3} /> 100% gratis
          </span>
          <span className="flex items-center gap-1.5">
            <Icono.check className="h-4 w-4 text-menta" strokeWidth={3} /> A distancia, híbrida o presencial
          </span>
          <span className="flex items-center gap-1.5">
            <Icono.check className="h-4 w-4 text-menta" strokeWidth={3} /> Nunca guardamos fotos
          </span>
        </div>
      </div>

      {/* ===== BLOQUES ALTERNANTES ===== */}
      <SeccionAlterna
        numero="01"
        kicker="Cada semana"
        titulo={<>5 cartas nuevas <span className="texto-degradado">recién repartidas</span></>}
        texto="Tú recibes las tuyas, tu pareja las suyas. Juega una para retarla o consentirla; cuando la cumpla, ganas el punto. Al final de la semana, barajas nuevas."
        mockupSrc="/capturas/casa.png"
        mockupAlt="La pantalla de inicio de Baraja2 con la mano de cartas"
      />

      <SeccionAlterna
        numero="02"
        kicker="Tienda"
        titulo={<>Plot twists que <span className="texto-degradado">cambian el juego</span></>}
        texto="Con los puntos que ganas compras plot twists en la Tienda: bloquéale una carta a tu pareja o róbasela. También se desbloquean solos al llegar a los 3 puntos."
        cta={{ href: irApp, label: 'Ver la Tienda' }}
        mockupSrc="/capturas/tienda.png"
        mockupAlt="La Tienda de Baraja2"
        invertido
      />

      <SeccionAlterna
        numero="03"
        kicker="Modo Spicy"
        titulo={<>Con picardía, <span className="texto-degradado">sin cámaras</span></>}
        texto="Actívalo si son mayores de edad y aparece un catálogo aparte, más atrevido, para jugar cuando quieran. Baraja2 nunca pide ni guarda una sola foto: lo que pase, queda entre ustedes."
        mockupSrc="/capturas/carta.png"
        mockupAlt="Una carta de Baraja2 en detalle"
      />

      {/* ===== CÓMO FUNCIONA ===== */}
      <section className="lp-seccion py-20">
        <Reveal>
          <span className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-rosa-acento">
            Así empieza
          </span>
          <h2 className="lp-titulo mt-3 !text-4xl sm:!text-5xl">De cero a jugando en 2 minutos</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => {
            const Ico = p.icono;
            return (
              <Reveal key={p.titulo} delay={i * 0.06}>
                <div className="lp-card h-full">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full degradado-marca text-white">
                      <Ico className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <span className="font-heading text-3xl font-extrabold text-white/10">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-bold text-white">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-white/60">{p.texto}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {EXTRAS.map((e) => {
              const Ico = e.icono;
              return (
                <div key={e.titulo} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="mt-0.5 text-rosa-acento">
                    <Ico className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-bold text-white">{e.titulo}</p>
                    <p className="text-xs text-white/55">{e.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* ===== INSTALAR ===== */}
      <section className="relative py-20">
        <div className="absolute inset-0 -z-10 degradado-marca opacity-[0.14]" />
        <div className="lp-seccion">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="flex mx-auto h-16 w-16 items-center justify-center rounded-2xl degradado-marca text-white">
                <Icono.bolsa className="h-8 w-8" strokeWidth={2} />
              </span>
              <h2 className="lp-titulo mt-5 !text-4xl sm:!text-5xl">Llévenla en el teléfono</h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
                Baraja2 es una app web: se instala desde aquí, sin tiendas. Se abre a
                pantalla completa, con su ícono, y funciona aunque haya poca señal.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { n: '1', t: 'Abre baraja2 en tu navegador', i: Icono.casa },
              { n: '2', t: 'Toca "Instalar" o "Añadir a inicio"', i: Icono.bolsa },
              { n: '3', t: 'Ábrela desde tu pantalla de inicio', i: Icono.corazon },
            ].map((s, idx) => {
              const Ico = s.i;
              return (
                <Reveal key={s.n} delay={idx * 0.06}>
                  <div className="lp-card h-full text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                      <Ico className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <p className="mt-2 font-heading text-2xl font-extrabold text-white/20">{s.n}</p>
                    <p className="text-sm text-white/70">{s.t}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col items-center gap-3">
              <BotonInstalar />
              <Link href={irApp} className="text-sm font-bold text-white hover:underline">
                {autenticado ? 'Abrir mi baraja →' : 'O empieza en el navegador →'}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="lp-seccion py-20">
        <Reveal>
          <h2 className="lp-titulo text-center !text-4xl sm:!text-5xl">Dudas rápidas</h2>
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="lp-card group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-base font-bold text-white">
                  {f.q}
                  <Icono.siguiente
                    className="h-5 w-5 shrink-0 text-white/40 transition group-open:rotate-90"
                    strokeWidth={2.5}
                  />
                </summary>
                <p className="mt-3 text-sm text-white/65">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== CIERRE ===== */}
      <section className="relative py-24 text-center">
        <div className="hero-fondo !opacity-90" />
        <div className="lp-seccion">
          <Reveal>
            <h2 className="lp-mega !text-5xl sm:!text-6xl">
              Empiecen a <span className="texto-degradado">jugar</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/70">
              5 cartas los esperan esta semana.
            </p>
            <Link href={irApp} className="cta-grande mt-8 !px-10 !py-4 !text-lg">
              {autenticado ? 'Entrar a mi baraja' : 'Crear cuenta gratis'}
              <Icono.flecha className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 bg-noche">
        <div className="lp-seccion grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <LogoBaraja2 tamano={26} />
              <span className="font-heading text-lg font-extrabold text-white">Baraja2</span>
            </div>
            <p className="mt-3 text-sm text-white/50">
              El juego de cartas semanal para vivir su relación jugando.
            </p>
          </div>
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/40">
              Producto
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link href="/registro" className="hover:text-white">Crear cuenta</Link></li>
              <li><Link href="/login" className="hover:text-white">Iniciar sesión</Link></li>
              <li><Link href={irApp} className="hover:text-white">Abrir la app</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/40">
              Privacidad
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>Nunca recibimos ni guardamos fotos</li>
              <li>Solo tú y tu pareja ven sus cartas</li>
              <li>Mayoría de edad para el modo Spicy</li>
            </ul>
          </div>
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-widest text-white/40">
              Instalar
            </p>
            <p className="mt-3 text-sm text-white/60">
              Se instala desde la web, sin tiendas. Android: menú → Instalar app. iPhone:
              Compartir → Añadir a inicio.
            </p>
          </div>
        </div>
        <div className="lp-seccion flex flex-col items-center justify-between gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row">
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
