// Server Actions de autenticación (registro, login, logout)
// Implementa BJ2-008
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { esquemaRegistro, esquemaLogin } from '@/lib/validaciones/auth';
import { fallo, type ResultadoAccion } from './_resultado';

export async function registrarse(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaRegistro.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmoMayorEdad: formData.get('confirmoMayorEdad') === 'on',
  });

  if (!parsed.success) {
    return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);
  }

  const supabase = crearClienteServidor();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nombre: parsed.data.nombre,
        confirmo_mayor_edad: parsed.data.confirmoMayorEdad,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return fallo('EMAIL_EN_USO', 'Ya existe una cuenta con ese correo.');
    }
    return fallo('ERROR_REGISTRO', 'No pudimos crear tu cuenta. Inténtalo de nuevo.');
  }

  revalidatePath('/', 'layout');
  redirect('/vincular');
}

export async function iniciarSesion(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaLogin.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);
  }

  const supabase = crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return fallo('CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function cerrarSesion(): Promise<void> {
  const supabase = crearClienteServidor();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/** Completa el perfil de quien entró con Google / Discord / teléfono: nombre + edad. */
export async function completarPerfilInicial(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const nombre = String(formData.get('nombre') ?? '').trim();
  const mayorEdad = formData.get('confirmoMayorEdad') === 'on';

  if (nombre.length < 2 || nombre.length > 40) {
    return fallo('DATOS_INVALIDOS', 'Escribe tu nombre (2 a 40 letras).');
  }
  if (!mayorEdad) {
    return fallo('DATOS_INVALIDOS', 'Debes confirmar que eres mayor de edad.');
  }

  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fallo('NO_AUTENTICADO');

  const { error } = await supabase.from('usuarios').upsert(
    {
      id: user.id,
      nombre,
      confirmo_mayor_edad: true,
    },
    { onConflict: 'id' },
  );

  if (error) {
    return fallo('ERROR_INESPERADO', 'No pudimos guardar tus datos. Inténtalo de nuevo.');
  }

  revalidatePath('/', 'layout');
  redirect('/vincular');
}
