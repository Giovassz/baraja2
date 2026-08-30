// Sondeo ligero: refresca los Server Components cada N segundos para reflejar
// cambios de la pareja (plot twists desbloqueados, cartas jugadas) sin recargar.
// Implementa BJ2-029
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AutoRefresh({ segundos = 12 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const visible = () =>
      typeof document === 'undefined' || document.visibilityState === 'visible';
    const t = setInterval(() => {
      if (visible()) router.refresh();
    }, segundos * 1000);
    return () => clearInterval(t);
  }, [router, segundos]);
  return null;
}
