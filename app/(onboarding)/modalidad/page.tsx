// Selección de modalidad de relación (sección 0.1): Distancia / Híbrida / Física
// Implementa BJ2-009
import { redirect } from 'next/navigation';
import { obtenerParejaActual } from '@/lib/datos';
import { SelectorModalidad } from './SelectorModalidad';

export const metadata = { title: 'Modalidad de su relación' };

export default async function ModalidadPage() {
  const pareja = await obtenerParejaActual();
  if (pareja) redirect('/avatar'); // el espacio ya existe

  return (
    <section className="widget flex flex-col gap-4">
      <div>
        <h2 className="text-2xl">¿Cómo viven su relación?</h2>
        <p className="mt-1 text-sm text-morado-marca/70">
          Elige la que más se parezca a su día a día. Define qué retos van a recibir.
        </p>
      </div>
      <SelectorModalidad />
    </section>
  );
}
