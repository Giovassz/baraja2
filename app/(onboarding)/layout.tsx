// Layout del onboarding (sección 2)
import { obtenerUsuarioActual } from '@/lib/datos';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await obtenerUsuarioActual(); // exige sesión

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      {children}
    </main>
  );
}
