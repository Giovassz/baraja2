// Server Action de la Tienda: comprar un plot twist gastando puntos
// Función nueva pedida por el usuario.
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { crearClienteServidor } from '@/lib/supabase/server';
import { exito, fallo, codigoDesdeError, type ResultadoAccion } from './_resultado';

const esquema = z.object({ catalogoId: z.string().uuid() });

export async function comprarPlotTwist(catalogoId: string): Promise<ResultadoAccion> {
  const parsed = esquema.safeParse({ catalogoId });
  if (!parsed.success) return fallo('DATOS_INVALIDOS');

  const supabase = crearClienteServidor();
  const { error } = await supabase.rpc('comprar_plot_twist', {
    p_catalogo_id: parsed.data.catalogoId,
  });
  if (error) return fallo(codigoDesdeError(error));

  revalidatePath('/tienda');
  revalidatePath('/dashboard');
  return exito('¡Plot twist comprado! Ya lo tienes listo para usar.');
}
