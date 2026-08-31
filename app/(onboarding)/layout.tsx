// Layout del onboarding (sección 2)
import { redirect } from 'next/navigation';
import { obtenerUsuarioActual } from '@/lib/datos';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obtenerUsuarioActual(); // exige sesión

  // Cuentas sociales / teléfono: primero nombre + edad.
  const nombreOk = !!usuario.nombre && usuario.nombre !== 'Jugador';
  if (!nombreOk || !usuario.confirmo_mayor_edad) {
    redirect('/bienvenida');
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      {children}
    </main>
  );
}
