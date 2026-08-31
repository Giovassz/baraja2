// Pantalla de registro (sección 2). Verificación de mayoría de edad: checkbox simple (supuesto S6).
// Implementa BJ2-008
import Link from 'next/link';
import { TarjetaAuth } from '@/components/auth/TarjetaAuth';
import { PanelAcceso } from '@/components/auth/PanelAcceso';

export const metadata = { title: 'Crear cuenta' };

export default function RegistroPage() {
  return (
    <TarjetaAuth>
      <h2 className="font-heading text-2xl font-bold text-white">Creen su cuenta</h2>
      <p className="mt-1 text-sm text-white/60">
        Cada quien crea la suya y después vinculan su espacio.
      </p>

      <PanelAcceso modo="registro" />

      <p className="mt-3 text-center text-[11px] text-white/45">
        Con Google, Discord o teléfono te pediremos tu nombre y confirmar tu edad en el
        siguiente paso.
      </p>

      <div className="mt-4 border-t border-white/10 pt-4 text-center text-sm text-white/70">
        ¿Ya tienen cuenta?{' '}
        <Link href="/login" className="font-bold text-rosa-acento hover:underline">
          Inicia sesión
        </Link>
      </div>
    </TarjetaAuth>
  );
}
