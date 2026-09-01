// Hub de vinculación: crear espacio nuevo o unirse con código (sección 2)
// Implementa BJ2-009, BJ2-010, BJ2-011
import { redirect } from 'next/navigation';
import { obtenerUsuarioActual, obtenerParejaActual } from '@/lib/datos';
import { PanelVincular } from './PanelVincular';
import { EsperandoPareja } from './EsperandoPareja';

export const metadata = { title: 'Vincular su espacio' };

export default async function VincularPage() {
  const usuario = await obtenerUsuarioActual();
  const pareja = await obtenerParejaActual();

  if (pareja?.usuario_2_id) {
    // Ya están vinculados: falta avatar, o activar notificaciones antes del dashboard.
    redirect(usuario.avatar_id ? '/notificaciones' : '/avatar');
  }

  if (pareja && pareja.usuario_1_id === usuario.id) {
    // El creador espera a que su pareja use el código.
    return (
      <EsperandoPareja
        codigo={pareja.codigo_invitacion}
        nombreEspacio={pareja.nombre_espacio ?? 'su espacio'}
        tieneAvatar={!!usuario.avatar_id}
      />
    );
  }

  return <PanelVincular />;
}
