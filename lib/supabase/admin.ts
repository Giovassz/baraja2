// Cliente de Supabase con llave de servicio (service_role) — SOLO para uso en servidor:
// cron de reinicio semanal, envío de Web Push y scripts de importación de catálogo.
// Nunca debe importarse desde código de cliente.
// Implementa BJ2-003
import { createClient } from '@supabase/supabase-js';
import type { Database } from './tipos';

export function crearClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const llaveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !llaveServicio) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.',
    );
  }

  return createClient<Database>(url, llaveServicio, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
