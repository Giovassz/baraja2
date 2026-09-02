// Cambiar avatar desde Perfil: foto propia (Storage) o un avatar del catálogo.
// Un solo botón "Guardar" aplica lo que se haya elegido — foto nueva si se subió una,
// si no, el avatar de catálogo seleccionado — para que el flujo sea el mismo sin
// importar cuál de las dos opciones elijas.
// Implementa BJ2-042
'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { Boton } from '@/components/ui/Boton';
import { Icono, ICONOS_ANIMAL } from '@/components/ui/iconos';
import { CATALOGO_AVATARES } from '@/lib/reglas/avatares';
import { actualizarAvatarPerfil, subirFotoAvatar, quitarFotoAvatar } from '@/lib/actions/perfil';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 4 * 1024 * 1024; // 4 MB

export function SelectorAvatarPerfil({
  nombre,
  avatarId,
  fotoUrl,
  tamano = 56,
}: {
  nombre: string;
  avatarId: string | null;
  fotoUrl: string | null;
  tamano?: number;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="relative shrink-0 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-rosa-acento/40"
        aria-label="Cambiar avatar"
      >
        <Avatar avatarId={avatarId} fotoUrl={fotoUrl} nombre={nombre} tamano={tamano} anillo={false} />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-rosa-acento text-white ring-2 ring-superficie">
          <Icono.lapiz className="h-3 w-3" strokeWidth={2.5} />
        </span>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-end justify-center bg-noche/90 p-4 backdrop-blur-md sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAbierto(false)}
          >
            <motion.div
              className="widget flex w-full max-w-md flex-col gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg text-white">Cambiar avatar</h3>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                  className="rounded-full bg-white/10 p-1.5 text-white"
                >
                  <Icono.cerrar className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>

              <EditorAvatar
                nombre={nombre}
                avatarId={avatarId}
                fotoUrl={fotoUrl}
                onGuardado={() => setAbierto(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EditorAvatar({
  nombre,
  avatarId,
  fotoUrl,
  onGuardado,
}: {
  nombre: string;
  avatarId: string | null;
  fotoUrl: string | null;
  onGuardado: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // vistaFoto: lo que se ve como foto ahora mismo — puede ser la ya guardada en el
  // servidor, una recién elegida (todavía sin guardar) o null si se optó por catálogo.
  const [vistaFoto, setVistaFoto] = useState<string | null>(fotoUrl);
  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(avatarId);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    [],
  );

  function elegirArchivo(f: File) {
    setError(null);
    if (!TIPOS_PERMITIDOS.includes(f.type)) {
      setError('Usa una foto en formato JPG, PNG o WEBP.');
      return;
    }
    if (f.size > TAMANO_MAXIMO) {
      setError('La foto no puede pesar más de 4 MB.');
      return;
    }
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(f);
    blobUrlRef.current = url;
    setArchivoNuevo(f);
    setVistaFoto(url);
  }

  function elegirCatalogo(id: string) {
    setError(null);
    setSeleccion(id);
    setArchivoNuevo(null);
    setVistaFoto(null);
  }

  function quitarFoto() {
    setError(null);
    if (archivoNuevo) {
      // Todavía no se había guardado — no hay nada que borrar del servidor.
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setArchivoNuevo(null);
      setVistaFoto(null);
      return;
    }
    if (guardando) return;
    setGuardando(true);
    quitarFotoAvatar().then(() => {
      setGuardando(false);
      setVistaFoto(null);
      onGuardado();
    });
  }

  async function guardar() {
    if (guardando) return;
    setGuardando(true);
    setError(null);

    if (archivoNuevo) {
      const formData = new FormData();
      formData.set('foto', archivoNuevo);
      const r = await subirFotoAvatar(null, formData);
      setGuardando(false);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo guardar.');
        return;
      }
      onGuardado();
      return;
    }

    const formData = new FormData();
    formData.set('avatarId', seleccion ?? '');
    const r = await actualizarAvatarPerfil(null, formData);
    setGuardando(false);
    if (!r.ok) {
      setError(r.mensaje ?? 'No se pudo guardar.');
      return;
    }
    onGuardado();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar avatarId={seleccion} fotoUrl={vistaFoto} nombre={nombre} tamano={96} />
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) elegirArchivo(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="boton-secundario"
          >
            <Icono.camara className="h-4 w-4" strokeWidth={2.5} />
            Subir foto
          </button>
          {vistaFoto && (
            <button type="button" onClick={quitarFoto} className="boton-secundario">
              <Icono.papelera className="h-4 w-4" strokeWidth={2.5} />
              Quitar foto
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-white/40">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] font-bold uppercase tracking-wide">
          O elige del catálogo
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {CATALOGO_AVATARES.map((a) => {
          const IconoAnimal = ICONOS_ANIMAL[a.icono];
          const activo = !vistaFoto && seleccion === a.id;
          return (
            <button
              type="button"
              key={a.id}
              onClick={() => elegirCatalogo(a.id)}
              aria-pressed={activo}
              title={a.nombre}
              className={`relative flex aspect-square items-center justify-center rounded-full shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)] transition ${
                activo ? 'ring-4 ring-rosa-acento' : 'ring-2 ring-lavanda/40'
              }`}
              style={{ background: `linear-gradient(145deg, ${a.color}, ${a.colorSecundario})` }}
            >
              <IconoAnimal
                className="h-1/2 w-1/2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                strokeWidth={2}
              />
              {activo && (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-rosa-acento p-1 text-white">
                  <Icono.check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-center text-xs text-rosa-acento">{error}</p>}

      <Boton type="button" onClick={guardar} cargando={guardando} className="w-full">
        Guardar
      </Boton>
    </div>
  );
}
