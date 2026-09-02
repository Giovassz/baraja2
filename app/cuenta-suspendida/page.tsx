// Se muestra cuando obtenerUsuarioActual() detecta cuenta_activa = false (ver
// lib/datos.ts). No exige nada más: si llegaste aquí es porque ya tienes sesión
// pero un admin desactivó tu cuenta desde /admin > Usuarios.
import { Icono } from '@/components/ui/iconos';
import { cerrarSesion } from '@/lib/actions/auth';

export const metadata = { title: 'Cuenta desactivada' };

export default function CuentaSuspendidaPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="widget max-w-sm">
        <Icono.candado className="mx-auto h-12 w-12 text-rosa-acento" strokeWidth={2} />
        <h1 className="mt-3 text-2xl">Cuenta desactivada</h1>
        <p className="mt-2 text-white/70">
          Tu cuenta fue desactivada temporalmente. Si crees que es un error,
          contáctanos.
        </p>
        <form action={cerrarSesion} className="mt-5">
          <button className="boton-secundario w-full">
            <Icono.salir className="h-4 w-4" strokeWidth={2.5} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
