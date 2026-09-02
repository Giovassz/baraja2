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
  esquemaAlternarCuentaActiva,
  esquemaAgregarCartasCatalogo,
  esquemaDesactivarCartaCatalogo,
  esquemaEditarCartaCatalogo,
  esquemaEditarUsuario,
  esquemaEliminarUsuario,
  esquemaAgregarPlotTwists,
  esquemaEditarPlotTwist,
  esquemaDesactivarPlotTwist,
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

/** Activa o desactiva el acceso de una cuenta (ver obtenerUsuarioActual en lib/datos.ts). */
export async function alternarCuentaActiva(
  usuarioId: string,
  activo: boolean,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaAlternarCuentaActiva.safeParse({ usuarioId, activo });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  if (parsed.data.usuarioId === usuario.id && !parsed.data.activo) {
    return fallo('DATOS_INVALIDOS', 'No puedes desactivar tu propia cuenta.');
  }

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from('usuarios')
    .update({ cuenta_activa: parsed.data.activo })
    .eq('id', parsed.data.usuarioId);

  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/usuarios');
  return exito(parsed.data.activo ? 'Cuenta reactivada.' : 'Cuenta desactivada.');
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
  revalidatePath('/admin');
  return exito('Carta quitada del catálogo.');
}

/** Cambia el texto/tipo/modalidad/puntos de una carta ya existente en el catálogo. */
export async function editarCartaCatalogo(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaEditarCartaCatalogo.safeParse({
    id: formData.get('id'),
    texto: formData.get('texto'),
    tipo: formData.get('tipo'),
    modalidad: formData.get('modalidad'),
    puntos: formData.get('puntos'),
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from('catalogo_cartas')
    .update({
      texto: parsed.data.texto,
      tipo: parsed.data.tipo,
      modalidad: parsed.data.modalidad,
      puntos_otorgados: parsed.data.puntos,
    })
    .eq('id', parsed.data.id);
  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/cartas');
  revalidatePath('/admin');
  return exito('Carta actualizada.');
}

/** Cambia el nombre visible de un usuario. */
export async function editarNombreUsuario(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaEditarUsuario.safeParse({
    id: formData.get('id'),
    nombre: formData.get('nombre'),
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from('usuarios')
    .update({ nombre: parsed.data.nombre })
    .eq('id', parsed.data.id);
  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/usuarios');
  return exito('Nombre actualizado.');
}

/**
 * Elimina la cuenta por completo (auth.users, con cascada a usuarios). Ojo: solo
 * usuarios(id) tiene "on delete cascade" hacia auth.users — cartas_asignadas,
 * parejas, historial_eventos, etc. NO la tienen, así que esto falla (a propósito,
 * por integridad referencial de Postgres) para cualquier cuenta que ya haya jugado.
 * Sirve para limpiar cuentas de prueba recién creadas sin actividad todavía.
 */
export async function eliminarUsuario(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaEliminarUsuario.safeParse({ id: formData.get('id') });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  if (parsed.data.id === usuario.id) {
    return fallo('DATOS_INVALIDOS', 'No puedes eliminar tu propia cuenta desde aquí.');
  }

  const admin = crearClienteAdmin();
  const { error } = await admin.auth.admin.deleteUser(parsed.data.id);
  if (error) {
    return fallo(
      'ERROR_INESPERADO',
      `No se pudo eliminar — probablemente porque esta cuenta ya tiene actividad de juego (cartas, puntos, historial) y esas tablas no permiten borrado en cascada. Detalle: ${error.message}`,
    );
  }

  revalidatePath('/admin/usuarios');
  revalidatePath('/admin');
  return exito('Cuenta eliminada.');
}

/**
 * Agrega plot twists al catálogo. Cada línea es "Nombre: Descripción" — se separa
 * en el primer ":" para no depender de comas ni otro delimitador que pueda aparecer
 * dentro de la descripción. Salta duplicados por nombre (igual criterio que cartas).
 */
export async function agregarPlotTwists(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaAgregarPlotTwists.safeParse({
    tipo: formData.get('tipo'),
    modalidad: formData.get('modalidad'),
    efecto: formData.get('efecto'),
    lineas: formData.get('lineas'),
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const filas = parsed.data.lineas
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linea) => {
      const i = linea.indexOf(':');
      if (i === -1) return { nombre: linea, descripcion: linea };
      return { nombre: linea.slice(0, i).trim(), descripcion: linea.slice(i + 1).trim() };
    })
    .filter((f) => f.nombre.length > 0);

  if (filas.length === 0) {
    return fallo('DATOS_INVALIDOS', 'Escribe al menos un plot twist.');
  }

  const admin = crearClienteAdmin();
  const { data: existentes, error: errorLectura } = await admin
    .from('catalogo_plot_twists')
    .select('nombre')
    .eq('activo', true);
  if (errorLectura) return fallo('ERROR_INESPERADO');

  const yaExisten = new Set((existentes ?? []).map((p) => p.nombre.trim().toLowerCase()));
  const nuevos = filas.filter((f) => !yaExisten.has(f.nombre.toLowerCase()));
  const duplicados = filas.length - nuevos.length;

  if (nuevos.length === 0) {
    return fallo('DATOS_INVALIDOS', 'Esos plot twists ya están en el catálogo.');
  }

  const { error } = await admin.from('catalogo_plot_twists').insert(
    nuevos.map((f) => ({
      nombre: f.nombre,
      descripcion: f.descripcion,
      tipo: parsed.data.tipo,
      modalidad: parsed.data.modalidad,
      efecto: parsed.data.efecto,
    })),
  );
  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/plot-twists');
  const mensaje =
    duplicados > 0
      ? `${nuevos.length} plot twist(s) agregado(s), ${duplicados} ya existían y se omitieron.`
      : `${nuevos.length} plot twist(s) agregado(s).`;
  return exito(mensaje);
}

/** Cambia nombre/descripción/tipo/modalidad/efecto de un plot twist existente. */
export async function editarPlotTwist(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaEditarPlotTwist.safeParse({
    id: formData.get('id'),
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    tipo: formData.get('tipo'),
    modalidad: formData.get('modalidad'),
    efecto: formData.get('efecto'),
  });
  if (!parsed.success) return fallo('DATOS_INVALIDOS', parsed.error.issues[0]?.message);

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from('catalogo_plot_twists')
    .update({
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion,
      tipo: parsed.data.tipo,
      modalidad: parsed.data.modalidad,
      efecto: parsed.data.efecto,
    })
    .eq('id', parsed.data.id);
  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/plot-twists');
  return exito('Plot twist actualizado.');
}

/** "Quitar" un plot twist en realidad lo desactiva — mismo motivo que las cartas:
 * plot_twists_desbloqueados referencia su id sin cascada de borrado. */
export async function desactivarPlotTwist(
  _prev: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const usuario = await obtenerUsuarioActual();
  if (!esCorreoAdmin(usuario.email)) return fallo('NO_AUTENTICADO');

  const parsed = esquemaDesactivarPlotTwist.safeParse({ id: formData.get('id') });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from('catalogo_plot_twists')
    .update({ activo: false })
    .eq('id', parsed.data.id);
  if (error) return fallo('ERROR_INESPERADO');

  revalidatePath('/admin/plot-twists');
  revalidatePath('/admin');
  return exito('Plot twist quitado del catálogo.');
}
