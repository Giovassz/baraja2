// La configuración de notificaciones ahora vive dentro de /perfil (barra inferior).
// Se mantiene la ruta por compatibilidad y redirige.
// Implementa BJ2-040
import { redirect } from 'next/navigation';

export default function AjustesNotificacionesPage() {
  redirect('/perfil');
}
