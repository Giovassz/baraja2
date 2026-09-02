// Hook reactivo del tema activo. Antes, componentes como PilaRetos leían
// document.documentElement.getAttribute('data-tema') una sola vez al montar — si el
// usuario cambiaba de tema en Perfil y volvía a Casa sin que ese componente se
// desmontara de verdad (el router de Next.js puede reusar una página ya renderizada),
// se quedaba pegado en el tema viejo. Este hook escucha el evento que dispara
// SelectorTema al cambiar, así que se actualiza al instante sin depender de un
// remontaje.
// Implementa BJ2-041
'use client';

import { useEffect, useState } from 'react';
import { TEMA_POR_DEFECTO, EVENTO_CAMBIO_TEMA, ICONO_POR_TEMA } from '@/lib/reglas/temas';

function leerTemaDelDom(): string {
  if (typeof document === 'undefined') return TEMA_POR_DEFECTO;
  return document.documentElement.getAttribute('data-tema') ?? TEMA_POR_DEFECTO;
}

export function useTemaActivo(): string {
  // Ojo: el estado inicial SIEMPRE debe ser el tema por defecto, igual que en el
  // servidor (que no tiene acceso a localStorage/data-tema). Si el inicializador
  // leyera el DOM aquí, el primer render en el cliente ya vería el tema guardado
  // (el script anti-parpadeo del <head> corre antes de que React hidrate) mientras
  // el servidor renderizó el de por defecto — eso es justo lo que generaba el
  // "Warning: Prop did not match" en íconos como el de FondoCorazones/PilaRetos.
  // El valor real se corrige acá abajo, en el efecto, que corre después de hidratar.
  const [tema, setTema] = useState(TEMA_POR_DEFECTO);

  useEffect(() => {
    setTema(leerTemaDelDom());

    function alCambiar(evento: Event) {
      const detalle = (evento as CustomEvent<string>).detail;
      setTema(detalle ?? leerTemaDelDom());
    }

    window.addEventListener(EVENTO_CAMBIO_TEMA, alCambiar);
    return () => window.removeEventListener(EVENTO_CAMBIO_TEMA, alCambiar);
  }, []);

  return tema;
}

/** Ícono asociado al tema activo, actualizado en vivo. */
export function useIconoDeTema(): string {
  const tema = useTemaActivo();
  return ICONO_POR_TEMA[tema] ?? ICONO_POR_TEMA[TEMA_POR_DEFECTO];
}
