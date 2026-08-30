// Layout de las pantallas de autenticación
import { LogoBaraja2 } from '@/components/ui/LogoBaraja2';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="animate-flota">
          <LogoBaraja2 tamano={64} />
        </span>
        <div>
          <h1 className="text-3xl">Baraja2</h1>
          <p className="mt-1 text-morado-marca/70">
            El juego de cartas semanal para su relación
          </p>
        </div>
      </header>
      {children}
    </main>
  );
}
