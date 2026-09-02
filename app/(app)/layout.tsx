// Shell de la app autenticada (mobile-first): barra inferior siempre + barra
// superior SOLO en Casa (la monta el propio dashboard/page.tsx, no este layout
// compartido — así no aparece en Historial/Tienda/Perfil/Spicy).
// Cada persona tiene su propia cuenta/juego; el espacio (nombre) es compartido.
// Implementa BJ2-014
import { exigirParejaVinculada } from '@/lib/datos';
import { BarraInferior } from '@/components/nav/BarraInferior';
import { FondoCorazones } from '@/components/FondoCorazones';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await exigirParejaVinculada();

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <FondoCorazones />
      <main className="area-segura-inferior flex-1 p-4">{children}</main>
      <BarraInferior />
    </div>
  );
}
