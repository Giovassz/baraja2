// Layout inmersivo de las pantallas de autenticación (login / registro)
// Implementa BJ2-008
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';
import { FondoAuth } from '@/components/auth/FondoAuth';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <FondoAuth />
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-7 px-6 py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="animate-flota drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
            <LogoBaraja2 tamano={62} />
          </span>
          <div>
            <h1 className="font-heading text-[2rem] font-bold leading-none text-white">
              Baraja2
            </h1>
            <p className="mt-2 text-sm text-white/75">
              El juego de cartas semanal para su relación
            </p>
          </div>
        </header>

        {children}

        <p className="text-center text-[11px] leading-relaxed text-white/55">
          Baraja2 nunca comparte tus datos. Tu relación, su juego.
        </p>
      </main>
    </div>
  );
}
