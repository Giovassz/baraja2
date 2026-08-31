// Enrutador post-login: decide a dónde mandar al usuario recién autenticado
// (Google / Discord / teléfono / correo).
// Implementa BJ2-008
import { redirect } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CompletarPage() {
  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre, confirmo_mayor_edad, avatar_id, pareja_id')
    .eq('id', user.id)
    .maybeSingle();

  const nombreOk =
    !!perfil?.nombre && perfil.nombre.trim() !== '' && perfil.nombre !== 'Jugador';

  if (!perfil || !nombreOk || !perfil.confirmo_mayor_edad) {
    redirect('/bienvenida');
  }

  if (!perfil.pareja_id) redirect('/vincular');

  // Ya tiene pareja: falta avatar o al dashboard.
  const { data: pareja } = await supabase
    .from('parejas')
    .select('usuario_2_id')
    .eq('id', perfil.pareja_id)
    .maybeSingle();

  if (!pareja?.usuario_2_id) redirect('/vincular');
  redirect(perfil.avatar_id ? '/dashboard' : '/avatar');
}
