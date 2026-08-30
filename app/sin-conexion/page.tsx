// Página de respaldo cuando no hay conexión (fallback del service worker)
// Implementa BJ2-006
import { WifiOff } from 'lucide-react';

export const metadata = {
  title: 'Sin conexión',
};

export default function SinConexionPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="widget max-w-sm">
        <WifiOff className="mx-auto h-12 w-12 text-rosa-acento" strokeWidth={2} />
        <h1 className="mt-3 text-2xl">Sin conexión</h1>
        <p className="mt-2 text-white/70">
          No pudimos cargar esta parte de Baraja2. Revisa tu internet y vuelve a
          intentarlo; tus cartas te esperan.
        </p>
      </div>
    </main>
  );
}
