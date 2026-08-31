// Un paso para quien entró con Google / Discord / teléfono: nombre + mayoría de edad.
// Implementa BJ2-008, BJ2-012 (S6)
import { redirect } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';
import { TarjetaAuth } from '@/components/auth/TarjetaAuth';
import { FormularioBienvenida } from './FormularioBienvenida';

export const metadata = { title: 'Bienvenido' };
export const dynamic = 'force-dynamic';

export default async function BienvenidaPage() {
  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre, confirmo_mayor_edad')
    .eq('id', user.id)
    .maybeSingle();

  const meta = user.user_metadata ?? {};
  const nombreMeta =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.preferred_username === 'string' && meta.preferred_username) ||
    '';

  const nombrePrevio =
    perfil?.nombre && perfil.nombre !== 'Jugador'
      ? perfil.nombre
      : String(nombreMeta).split(' ')[0] || '';

  // Si ya está completo, seguir al onboarding.
  if (nombrePrevio && perfil?.confirmo_mayor_edad) redirect('/vincular');

  return (
    <TarjetaAuth>
      <h2 className="font-heading text-2xl font-bold text-white">¡Ya casi!</h2>
      <p className="mt-1 text-sm text-white/60">
        Solo falta cómo te llamas y confirmar tu edad.
      </p>
      <FormularioBienvenida nombrePrevio={nombrePrevio} />
    </TarjetaAuth>
  );
}
