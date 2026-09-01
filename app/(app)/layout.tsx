// Shell de la app autenticada (mobile-first): barra superior con puntos + barra inferior.
// Cada persona tiene su propia cuenta/juego; el espacio (nombre) es compartido.
// Implementa BJ2-014
import { exigirParejaVinculada, obtenerResumenChrome } from '@/lib/datos';
import { BarraSuperior } from '@/components/nav/BarraSuperior';
import { BarraInferior } from '@/components/nav/BarraInferior';
import { FondoCorazones } from '@/components/FondoCorazones';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await exigirParejaVinculada();
  const chrome = await obtenerResumenChrome();

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <FondoCorazones />
      <BarraSuperior
        nombreEspacio={chrome.nombreEspacio}
        nivel={chrome.nivel.nivel}
        puntos={chrome.puntos}
      />
      <main className="area-segura-superior area-segura-inferior flex-1 p-4">
        {children}
      </main>
      <BarraInferior />
    </div>
  );
}
