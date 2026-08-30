/**
 * Importa seed/catalogo.json a las tablas catalogo_cartas y catalogo_plot_twists.
 * Implementa BJ2-041, BJ2-042
 *
 * Uso:
 *   npm run importar-catalogo -- [ruta-al-json] [--reemplazar]
 *
 * - Valida el archivo con zod ESTRICTO (sección 4.6). Si no cumple, aborta con
 *   mensaje claro y SIN insertar nada (nunca inserción parcial silenciosa).
 * - Sin --reemplazar: inserta solo lo que falta (evita duplicados por texto/nombre).
 * - Con --reemplazar: desactiva (activo=false) todo el catálogo previo y luego inserta.
 *
 * Requiere en el entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase/tipos';
import { esquemaCatalogo } from '../lib/validaciones/catalogo';

function abortar(mensaje: string): never {
  console.error(`\n❌ ${mensaje}\n`);
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const reemplazar = args.includes('--reemplazar');
  const rutaArg = args.find((a) => !a.startsWith('--'));
  const ruta = resolve(process.cwd(), rutaArg ?? 'seed/catalogo.json');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !llave) {
    abortar(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno. ' +
        'Cárgalas (por ejemplo con un archivo .env.local y `--env-file`).',
    );
  }

  let crudo: unknown;
  try {
    crudo = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    abortar(`No se pudo leer o parsear el archivo ${ruta}: ${(e as Error).message}`);
  }

  const parsed = esquemaCatalogo.safeParse(crudo);
  if (!parsed.success) {
    console.error(`\n❌ El archivo ${ruta} no cumple el formato esperado (sección 4.6):\n`);
    for (const issue of parsed.error.issues) {
      console.error(`  · ${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
    }
    process.exit(1);
  }

  const { cartas, plot_twists: plotTwists } = parsed.data;
  const supabase = createClient<Database>(url, llave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\n📦 Catálogo válido: ${cartas.length} cartas, ${plotTwists.length} plot twists.`);

  if (reemplazar) {
    console.log('♻️  --reemplazar: desactivando catálogo previo…');
    const r1 = await supabase
      .from('catalogo_cartas')
      .update({ activo: false })
      .not('id', 'is', null);
    const r2 = await supabase
      .from('catalogo_plot_twists')
      .update({ activo: false })
      .not('id', 'is', null);
    if (r1.error || r2.error) {
      abortar(`No se pudo desactivar el catálogo previo: ${(r1.error ?? r2.error)?.message}`);
    }
  }

  // --- Cartas ---
  const { data: cartasExistentes, error: eCartas } = await supabase
    .from('catalogo_cartas')
    .select('texto');
  if (eCartas) abortar(`Error leyendo catalogo_cartas: ${eCartas.message}`);
  const textosPrevios = new Set((cartasExistentes ?? []).map((c) => c.texto.trim()));

  const cartasAInsertar = cartas
    .filter((c) => reemplazar || !textosPrevios.has(c.texto.trim()))
    .map((c) => ({
      texto: c.texto.trim(),
      tipo: c.tipo,
      modalidad: c.modalidad,
      puntos_otorgados: c.puntos_otorgados,
      activo: true,
    }));

  if (cartasAInsertar.length > 0) {
    const { error } = await supabase.from('catalogo_cartas').insert(cartasAInsertar);
    if (error) abortar(`Error insertando cartas: ${error.message}`);
  }

  // --- Plot twists ---
  const { data: ptExistentes, error: ePt } = await supabase
    .from('catalogo_plot_twists')
    .select('nombre, modalidad, tipo');
  if (ePt) abortar(`Error leyendo catalogo_plot_twists: ${ePt.message}`);
  const clavePrevias = new Set(
    (ptExistentes ?? []).map((p) => `${p.nombre.trim()}|${p.modalidad}|${p.tipo}`),
  );

  const ptAInsertar = plotTwists
    .filter(
      (p) =>
        reemplazar ||
        !clavePrevias.has(`${p.nombre.trim()}|${p.modalidad}|${p.tipo}`),
    )
    .map((p) => ({
      nombre: p.nombre.trim(),
      descripcion: p.descripcion.trim(),
      efecto: p.efecto,
      modalidad: p.modalidad,
      tipo: p.tipo,
      activo: true,
    }));

  if (ptAInsertar.length > 0) {
    const { error } = await supabase.from('catalogo_plot_twists').insert(ptAInsertar);
    if (error) abortar(`Error insertando plot twists: ${error.message}`);
  }

  // --- Verificación de conteo ---
  const { count: totalCartas } = await supabase
    .from('catalogo_cartas')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true);
  const { count: totalPt } = await supabase
    .from('catalogo_plot_twists')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true);

  console.log(`\n✅ Importación terminada:`);
  console.log(`   Cartas insertadas ahora:      ${cartasAInsertar.length}`);
  console.log(`   Plot twists insertados ahora: ${ptAInsertar.length}`);
  console.log(`   Total activo en catálogo:     ${totalCartas ?? '?'} cartas, ${totalPt ?? '?'} plot twists`);
  console.log('');
}

main().catch((e) => abortar((e as Error).message));
