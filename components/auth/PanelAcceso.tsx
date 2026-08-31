// Panel de acceso: botones sociales (Google / Discord) + elección entre correo y
// teléfono. Lo usan /login y /registro.
// Implementa BJ2-008
'use client';

import { useState } from 'react';
import { BotonesSociales } from './BotonesSociales';
import { FormularioTelefono } from './FormularioTelefono';
import { FormularioLogin } from '@/app/(auth)/login/FormularioLogin';
import { FormularioRegistro } from '@/app/(auth)/registro/FormularioRegistro';
import { Icono } from '@/components/ui/iconos';

export function PanelAcceso({ modo }: { modo: 'login' | 'registro' }) {
  const [metodo, setMetodo] = useState<'correo' | 'telefono'>('correo');

  return (
    <div className="mt-6 flex flex-col gap-4">
      <BotonesSociales />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
          o con
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {/* Selector correo / teléfono */}
      <div className="flex gap-2 rounded-2xl bg-white/[0.05] p-1">
        <button
          type="button"
          onClick={() => setMetodo('correo')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-heading text-sm font-bold transition ${
            metodo === 'correo' ? 'bg-white/10 text-white' : 'text-white/50'
          }`}
        >
          <Icono.sobre className="h-4 w-4" strokeWidth={2.5} />
          Correo
        </button>
        <button
          type="button"
          onClick={() => setMetodo('telefono')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-heading text-sm font-bold transition ${
            metodo === 'telefono' ? 'bg-white/10 text-white' : 'text-white/50'
          }`}
        >
          <Icono.llamada className="h-4 w-4" strokeWidth={2.5} />
          Teléfono
        </button>
      </div>

      {metodo === 'telefono' ? (
        <FormularioTelefono />
      ) : modo === 'login' ? (
        <FormularioLogin />
      ) : (
        <FormularioRegistro />
      )}
    </div>
  );
}
