// Layout de las pantallas de autenticación
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <header className="text-center">
        <p className="font-heading text-5xl">🃏</p>
        <h1 className="mt-2 text-3xl text-morado-marca">Baraja2</h1>
        <p className="mt-1 text-morado-marca/70">
          El juego de cartas semanal para su relación.
        </p>
      </header>
      {children}
    </main>
  );
}
