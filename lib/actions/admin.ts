// Server Action del panel oculto /admin. Revalida quién es admin del lado del
// servidor (no basta con que la pantalla esté oculta): sin esto, cualquiera que
// adivine el nombre de la acción podría llamarla directo.
// Implementa: modo tester para cuentas de prueba.
'use server';

import { revalidatePath } from 'next/cache';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esCorreoAdmin } from '@/lib/admin';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import {
  esquemaAlternarTester,
  esquemaAgregarCartasCatalogo,
  esquemaDesactivarCartaCatalogo,
} from '@/lib/validaciones/admin';
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

/**
 * Agrega cartas al catálogo, una por línea de texto — mismo criterio que
 * scripts/importar-catalogo.ts: si el texto ya existe (activo), no lo duplica.
 */
export async function agregarCartasCatalogo(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaAgregarCartasCatalogo.safeParse({
    tipo: formData.get('tipo'),
    modalidad: formData.get('modalidad'),
    puntos: formData.get('puntos'),
    lineas: formData.get('lineas'),
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const textos = Array.from(
    new Set(
      parsed.data.lineas
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  );
  if (textos.length === 0) return fallo('DATOS_INVALIDOS', 'Escribe al menos una carta.');

  const admin = crearClienteAdmin();
  const { data: existentes, error: errorLectura } = await admin
    .from('catalogo_cartas')
    .select('texto')
    .eq('activo', true);
  if (errorLectura) return fallo('ERROR_INESPERADO');

  const yaExisten = new Set((existentes ?? []).map((c) => c.texto.trim().toLowerCase()));
  const nuevos = textos.filter((t) => !yaExisten.has(t.toLowerCase()));
  const duplicados = textos.length - nuevos.length;

  if (nuevos.length === 0) {
    return fallo('DATOS_INVALIDOS', 'Esas cartas ya están en el catálogo.');
  }

  const { error } = await admin.from('catalogo_cartas').insert(
    nuevos.map((texto) => ({
      texto,
      tipo: parsed.data.tipo,
      modalidad: parsed.data.modalidad,
      puntos_otorgados: parsed.data.puntos,
    })),
  );
  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/cartas');
  const mensaje =
    duplicados > 0
      ? `${nuevos.length} carta(s) agregada(s), ${duplicados} ya existían y se omitieron.`
      : `${nuevos.length} carta(s) agregada(s).`;
  return exito(mensaje);
}

/**
 * "Quitar" una carta del catálogo en realidad la desactiva (activo=false), nunca la
 * borra de verdad: cartas ya repartidas a jugadores (cartas_asignadas) apuntan a su
 * id con una referencia normal, así que un DELETE fallaría o rompería su historial.
 */
export async function desactivarCartaCatalogo(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaDesactivarCartaCatalogo.safeParse({ id: formData.get('id') });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from('catalogo_cartas')
    .update({ activo: false })
    .eq('id', parsed.data.id);
  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/cartas');
  return exito('Carta quitada del catálogo.');
}
