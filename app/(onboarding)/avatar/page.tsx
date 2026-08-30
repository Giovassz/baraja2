// Selección de avatar del catálogo estático (sección 4.5)
// Implementa BJ2-012
import { redirect } from 'next/navigation';
import { obtenerUsuarioActual, obtenerParejaActual } from '@/lib/datos';
import { SelectorAvatar } from './SelectorAvatar';

export const metadata = { title: 'Elige tu avatar' };

export default async function AvatarPage() {
  const usuario = await obtenerUsuarioActual();
  const pareja = await obtenerParejaActual();

  if (!pareja) redirect('/vincular');

  return (
    <section className="widget flex flex-col gap-4">
      <div>
        <h2 className="text-2xl">Elige tu avatar</h2>
        <p className="mt-1 text-sm text-white/70">
          Así te verá tu pareja en el marcador semanal.
        </p>
      </div>
      <SelectorAvatar avatarActual={usuario.avatar_id} />
    </section>
  );
}
