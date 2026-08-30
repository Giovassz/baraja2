// El detalle de carta se gestiona ahora desde la mesa de batalla en /dashboard.
// Se mantiene la ruta por compatibilidad de enlaces antiguos.
// Implementa BJ2-017
import { redirect } from 'next/navigation';

export default function CartaDetallePage() {
  redirect('/dashboard');
}
