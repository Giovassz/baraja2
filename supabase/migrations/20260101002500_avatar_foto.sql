-- Foto de perfil subida por el usuario (Perfil > Avatar). Si avatar_foto_url tiene
-- valor, la app la muestra en vez del avatar de catálogo (avatar_id).
--
-- El bucket de Storage "avatares" (público, límite 4 MB, solo jpeg/png/webp) ya se
-- creó vía script con la service role key — no hace falta crearlo aquí. Las Server
-- Actions que suben/quitan la foto también usan el cliente admin, así que no
-- necesitan políticas RLS sobre storage.objects.

alter table public.usuarios
  add column if not exists avatar_foto_url text;
