// Server Action del panel oculto /admin. Revalida quién es admin del lado del
// servidor (no basta con que la pantalla esté oculta): sin esto, cualquiera que
// adivine el nombre de la acción podría llamarla directo.
// Implementa: modo tester para cuentas de prueba.
'use server';

import { revalidatePath } from 'next/cache';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esCorreoAdmin } from '@/lib/admin';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { esquemaAlternarTester } from '@/lib/validaciones/admin';
import { exito, fallo, type ResultadoAccion } from './_resultado';

export async function alternarModoTester(
  usuarioId: string,
  activo: boolean,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaAlternarTester.safeParse({ usuarioId, activo });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from('usuarios')
    .update({ modo_tester: parsed.data.activo })
    .eq('id', parsed.data.usuarioId);

  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return exito(parsed.data.activo ? 'Modo tester activado.' : 'Modo tester desactivado.');
}
