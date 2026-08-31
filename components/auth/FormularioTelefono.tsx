// Inicio de sesión / registro con teléfono (SMS OTP de Supabase). Dos pasos:
// 1) escribir el número → se envía un código  2) escribir el código → entra.
// Implementa BJ2-008
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/browser';
import { CampoAuth } from './CampoAuth';
import { Icono } from '@/components/ui/iconos';

function normalizar(numero: string) {
  const limpio = numero.replace(/[^\d+]/g, '');
  if (limpio.startsWith('+')) return limpio;
  // sin prefijo: se asume México (+52)
  return `+52${limpio}`;
}

export function FormularioTelefono({ deshabilitado = false }: { deshabilitado?: boolean }) {
  const router = useRouter();
  const [paso, setPaso] = useState<'numero' | 'codigo'>('numero');
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (deshabilitado) return;
    setError(null);
    setCargando(true);
    const supabase = crearClienteNavegador();
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: normalizar(telefono),
    });
    setCargando(false);
    if (err) {
      setError(
        err.message.toLowerCase().includes('sms')
          ? 'El envío de SMS aún no está configurado en el servidor.'
          : 'No se pudo enviar el código. Revisa el número.',
      );
      return;
    }
    setPaso('codigo');
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const supabase = crearClienteNavegador();
    const { error: err } = await supabase.auth.verifyOtp({
      phone: normalizar(telefono),
      token: codigo.trim(),
      type: 'sms',
    });
    setCargando(false);
    if (err) {
      setError('Código incorrecto o expirado.');
      return;
    }
    router.push('/auth/completar');
    router.refresh();
  }

  if (paso === 'codigo') {
    return (
      <form onSubmit={verificar} className="flex flex-col gap-4">
        <CampoAuth
          etiqueta={`Código enviado a ${normalizar(telefono)}`}
          icono={Icono.escudo}
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={codigo}
          onChange={(ev) => setCodigo(ev.target.value)}
          required
        />
        {error && <p className="text-center text-xs text-rosa-acento">{error}</p>}
        <button type="submit" className="boton-primario h-12 w-full text-[15px]" disabled={cargando}>
          {cargando ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Verificar y entrar'
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setPaso('numero');
            setCodigo('');
            setError(null);
          }}
          className="text-center text-sm font-semibold text-white/60"
        >
          Cambiar número
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={enviarCodigo} className="flex flex-col gap-4">
      <CampoAuth
        etiqueta="Tu teléfono"
        icono={Icono.llamada}
        name="telefono"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="55 1234 5678"
        value={telefono}
        onChange={(ev) => setTelefono(ev.target.value)}
        ayuda="Con lada del país (ej. +52). Recibirás un código por SMS."
        required
        disabled={deshabilitado}
      />
      {error && <p className="text-center text-xs text-rosa-acento">{error}</p>}
      <button
        type="submit"
        className="boton-primario h-12 w-full text-[15px]"
        disabled={cargando || deshabilitado}
      >
        {cargando ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            Enviarme un código
            <Icono.flecha className="h-4 w-4" strokeWidth={2.5} />
          </>
        )}
      </button>
    </form>
  );
}
