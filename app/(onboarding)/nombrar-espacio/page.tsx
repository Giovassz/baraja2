// Nombrar el espacio compartido y crear la pareja (sección 2)
// Implementa BJ2-013
import { redirect } from 'next/navigation';
import { obtenerParejaActual } from '@/lib/datos';
import { esquemaModalidad } from '@/lib/validaciones/parejas';
import { FormularioNombrarEspacio } from './FormularioNombrarEspacio';

export const metadata = { title: 'Nombrar su espacio' };

export default async function NombrarEspacioPage({
  searchParams,
}: {
  searchParams: { modalidad?: string };
}) {
  const pareja = await obtenerParejaActual();
  if (pareja) redirect('/avatar');

  const modalidad = esquemaModalidad.safeParse({ modalidad: searchParams.modalidad });
  if (!modalidad.success) redirect('/modalidad');

  return (
    <section className="widget flex flex-col gap-4">
      <div>
        <h2 className="text-2xl">Ponle nombre a su espacio</h2>
        <p className="mt-1 text-sm text-white/70">
          Puede ser un apodo, la fecha en que empezaron, lo que quieran.
        </p>
      </div>
      <FormularioNombrarEspacio modalidad={modalidad.data.modalidad} />
    </section>
  );
}
