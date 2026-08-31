// Pantalla para crear la contraseña nueva (llega desde el link de recuperación)
// Implementa BJ2-008
import { TarjetaAuth } from '@/components/auth/TarjetaAuth';
import { FormularioNuevaPassword } from './FormularioNuevaPassword';

export const metadata = { title: 'Nueva contraseña' };

export default function ActualizarPasswordPage() {
  return (
    <TarjetaAuth>
      <h2 className="font-heading text-2xl font-bold text-white">Crea tu contraseña nueva</h2>
      <p className="mt-1 text-sm text-white/60">Ya casi. Escríbela dos veces para confirmar.</p>

      <div className="mt-6">
        <FormularioNuevaPassword />
      </div>
    </TarjetaAuth>
  );
}
