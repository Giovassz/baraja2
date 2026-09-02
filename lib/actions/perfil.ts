// Server Actions de Perfil: cambiar avatar de catálogo y subir/quitar foto de perfil.
// Distinto de lib/actions/parejas.ts (guardarAvatar) porque ese es del onboarding y
// siempre redirige al siguiente paso — aquí el usuario ya está dentro de la app.
// Implementa BJ2-042
'use server';

import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { obtenerUsuarioActual } from '@/lib/datos';
import { esquemaAvatar } from '@/lib/validaciones/parejas';
import { fallo, exito, codigoDesdeError, type ResultadoAccion } from './_resultado';

// Storage (subir/quitar la foto) se hace con el cliente admin en vez del de sesión:
// así no depende de políticas RLS de storage.objects que no se pueden crear por SQL
// normal. Sigue siendo seguro: la ruta siempre es "{usuario.id}/foto", y usuario.id
// sale de la sesión autenticada (obtenerUsuarioActual), nunca de un dato del cliente.

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 4 * 1024 * 1024; // 4 MB

/** Cambia el avatar de catálogo desde Perfil (sin redirigir, a diferencia del onboarding). */
export async function actualizarAvatarPerfil(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaAvatar.safeParse({ avatarId: formData.get('avatarId') });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const usuario = await obtenerUsuarioActual();
  const supabase = crearClienteServidor();

  // Elegir un avatar de catálogo reemplaza la foto subida, si había una.
  await crearClienteAdmin().storage.from('avatares').remove([`${usuario.id}/foto`]);

  const { error } = await supabase
    .from('usuarios')
    .update({ avatar_id: parsed.data.avatarId, avatar_foto_url: null })
    .eq('id', usuario.id);
  if (error) return fallo(codigoDesdeError(error), 'No pudimos guardar tu avatar.');

  revalidatePath('/', 'layout');
  return exito('Avatar actualizado.');
}

/** Sube una foto de perfil a Storage y la guarda como avatar activo. */
export async function subirFotoAvatar(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const archivo = formData.get('foto');
  if (!(archivo instanceof File) || archivo.size === 0) {
    return fallo('DATOS_INVALIDOS', 'Elige una foto primero.');
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return fallo('FOTO_INVALIDA');
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return fallo('FOTO_MUY_GRANDE');
  }

  const usuario = await obtenerUsuarioActual();
  const supabase = crearClienteServidor();
  const admin = crearClienteAdmin();
  const ruta = `${usuario.id}/foto`;

  const { error: errorSubida } = await admin.storage
    .from('avatares')
    .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
  if (errorSubida) {
    console.error('subirFotoAvatar: error subiendo a Storage:', errorSubida.message);
    return fallo('ERROR_SUBIENDO_FOTO');
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('avatares').getPublicUrl(ruta);

  const { error } = await supabase
    .from('usuarios')
    // Cache-buster: la ruta no cambia entre subidas (upsert), así que sin esto el
    // navegador podría seguir mostrando la foto vieja tras reemplazarla.
    .update({ avatar_foto_url: `${publicUrl}?v=${Date.now()}` })
    .eq('id', usuario.id);
  if (error) return fallo(codigoDesdeError(error), 'No pudimos guardar tu foto.');

  revalidatePath('/', 'layout');
  return exito('Foto actualizada.');
}

/** Quita la foto de perfil y vuelve a mostrar el avatar de catálogo. */
export async function quitarFotoAvatar(): Promise<void> {
  const usuario = await obtenerUsuarioActual();
  const supabase = crearClienteServidor();

  await crearClienteAdmin().storage.from('avatares').remove([`${usuario.id}/foto`]);
  await supabase.from('usuarios').update({ avatar_foto_url: null }).eq('id', usuario.id);

  revalidatePath('/', 'layout');
}
