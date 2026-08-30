// Pantalla de espera del creador: muestra el código y sondea hasta que la pareja se une
// Implementa BJ2-011
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';

export function EsperandoPareja({
  codigo,
  nombreEspacio,
  tieneAvatar,
}: {
  codigo: string;
  nombreEspacio: string;
  tieneAvatar: boolean;
}) {
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);

  // Sondeo ligero: refresca el Server Component cada 5 s; al vincularse redirige solo.
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [router]);

  async function compartir() {
    const texto = `Únete a nuestro espacio en Baraja2 con el código: ${codigo}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Baraja2', text: texto });
        return;
      } catch {
        /* cancelado */
      }
    }
    await navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <section className="widget flex flex-col items-center gap-4 text-center">
      <p className="font-heading text-5xl animate-late-corazon">💞</p>
      <h2 className="text-2xl">Ya casi</h2>
      <p className="text-sm text-morado-marca/70">
        Comparte este código con tu pareja para que se una a <strong>{nombreEspacio}</strong>.
      </p>

      <div className="w-full rounded-widget bg-white/70 py-4 font-heading text-4xl tracking-[0.4em] text-rosa-acento">
        {codigo}
      </div>

      <Boton variante="secundario" className="w-full" onClick={compartir}>
        {copiado ? '¡Código copiado!' : 'Compartir código'}
      </Boton>

      <p className="text-xs text-morado-marca/50">
        Esta pantalla se actualiza sola en cuanto tu pareja entre.
      </p>

      {!tieneAvatar && (
        <p className="text-xs text-morado-marca/50">
          Mientras tanto puedes{' '}
          <a href="/avatar" className="font-semibold text-rosa-acento">
            elegir tu avatar
          </a>
          .
        </p>
      )}
    </section>
  );
}
