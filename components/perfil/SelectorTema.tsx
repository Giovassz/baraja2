// Selector de tema de color (Perfil > Ajustes). Aplica al instante (sin recargar) y
// se guarda por dispositivo en localStorage — ver app/layout.tsx para cómo se evita
// el parpadeo al cargar con un tema distinto al rosa por defecto.
// Implementa BJ2-041
'use client';

import { useEffect, useState } from 'react';
import {
  CATALOGO_TEMAS,
  TEMA_POR_DEFECTO,
  CLAVE_TEMA_LOCALSTORAGE,
  EVENTO_CAMBIO_TEMA,
} from '@/lib/reglas/temas';
import { Icono } from '@/components/ui/iconos';

export function SelectorTema() {
  const [activo, setActivo] = useState(TEMA_POR_DEFECTO);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_TEMA_LOCALSTORAGE);
      if (guardado) setActivo(guardado);
    } catch {
      // localStorage puede fallar en modo privado — se queda con el rosa por defecto.
    }
  }, []);

  function elegir(valor: string) {
    setActivo(valor);
    document.documentElement.setAttribute('data-tema', valor);
    // Avisa a quien esté escuchando (useTemaActivo) para que se actualice al
    // instante aunque su componente no se vuelva a montar — antes esos componentes
    // solo leían el tema una vez al montar y se quedaban con el viejo.
    window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO_TEMA, { detail: valor }));
    try {
      localStorage.setItem(CLAVE_TEMA_LOCALSTORAGE, valor);
    } catch {
      // Sin persistencia entre sesiones, pero el cambio visual ya se aplicó.
    }
  }

  return (
    <div className="widget flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg">
        <Icono.paleta className="h-4 w-4 text-rosa-acento" strokeWidth={2.5} />
        Tema
      </h2>
      <div className="flex items-center justify-between gap-2">
        {CATALOGO_TEMAS.map((t) => {
          const seleccionado = activo === t.valor;
          return (
            <button
              key={t.valor}
              type="button"
              onClick={() => elegir(t.valor)}
              aria-pressed={seleccionado}
              aria-label={t.nombre}
              title={t.nombre}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                seleccionado ? 'ring-2 ring-white ring-offset-2 ring-offset-superficie' : ''
              }`}
              style={{ backgroundColor: t.vista }}
            >
              {seleccionado && <Icono.check className="h-4 w-4 text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
