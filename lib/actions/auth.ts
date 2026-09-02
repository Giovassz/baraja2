// Server Actions de autenticación (registro, login, logout)
// Implementa BJ2-008
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { crearClienteServidor } from '@/lib/supabase/server';
import { crearClienteAdmin } from '@/lib/supabase/admin';
import { esCorreoAdmin } from '@/lib/admin';
import {
  esquemaRegistro,
  esquemaLogin,
  esquemaRecuperar,
  esquemaNuevaPassword,
} from '@/lib/validaciones/auth';
import { exito, fallo, type ResultadoAccion } from './_resultado';

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

  // Creamos la cuenta directamente del lado del servidor (con la llave de servicio)
  // en vez de auth.signUp: así evitamos por completo el correo de confirmación —el
  // proyecto no tiene un proveedor de correo propio configurado y el de Supabase por
  // defecto tiene un límite de envíos muy bajo— y la persona entra de inmediato, sin
  // quedar atrapada pidiéndole que "inicie sesión" con una cuenta que no está confirmada.
  const admin = crearClienteAdmin();
  const { data: creado, error: errorCrear } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      nombre: parsed.data.nombre,
      confirmo_mayor_edad: parsed.data.confirmoMayorEdad,
    },
  });

  if (errorCrear) {
    const msg = errorCrear.message.toLowerCase();
    if (msg.includes('already been registered') || msg.includes('already exists')) {
      return fallo('EMAIL_EN_USO', 'Ya existe una cuenta con ese correo.');
    }
    console.error('Error creando cuenta:', errorCrear);
    return fallo('ERROR_REGISTRO', 'No pudimos crear tu cuenta. Inténtalo de nuevo.');
  }
  if (!creado.user) {
    return fallo('ERROR_REGISTRO', 'No pudimos crear tu cuenta. Inténtalo de nuevo.');
  }

  const supabase = crearClienteServidor();
  const { error: errorLogin } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (errorLogin) {
    console.error('Cuenta creada pero falló el inicio de sesión automático:', errorLogin);
    return fallo('ERROR_REGISTRO', 'Tu cuenta se creó. Inicia sesión para continuar.');
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
  // Solo el/los correo(s) de ADMIN_EMAILS caen directo al panel oculto — cualquier
  // otra cuenta sigue el flujo normal, aunque conozca la URL /admin.
  redirect(esCorreoAdmin(parsed.data.email) ? '/admin' : '/dashboard');
}

/** Manda el correo de "olvidé mi contraseña" (sección 2 — recuperación de cuenta). */
export async function solicitarRecuperacion(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaRecuperar.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);
  }

  const origen = process.env.NEXT_PUBLIC_URL_BASE ?? 'http://localhost:3000';
  const supabase = crearClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origen}/auth/callback?next=/actualizar-password`,
  });

  // Nunca decimos si el correo existe o no (evita que alguien confirme cuentas ajenas
  // probando emails); solo avisamos si Supabase truena por límite de envíos.
  if (error && error.message.toLowerCase().includes('rate limit')) {
    return fallo(
      'LIMITE_CORREOS',
      'Se pidieron muchos correos en poco tiempo. Espera unos minutos e inténtalo de nuevo.',
    );
  }

  return exito(
    'Si ese correo tiene una cuenta, te mandamos un link para crear una contraseña nueva. Revisa también la carpeta de spam.',
  );
}

/** Guarda la contraseña nueva; se usa desde el link del correo de recuperación. */
export async function actualizarPassword(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = esquemaNuevaPassword.safeParse({
    password: formData.get('password'),
    confirmarPassword: formData.get('confirmarPassword'),
  });

  if (!parsed.success) {
    return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);
  }

  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fallo(
      'SIN_SESION',
      'Este link ya expiró o ya se usó. Pide uno nuevo desde "Olvidé mi contraseña".',
    );
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return fallo('ERROR_INESPERADO', 'No pudimos actualizar tu contraseña. Inténtalo de nuevo.');
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
