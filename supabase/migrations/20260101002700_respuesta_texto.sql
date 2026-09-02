-- Retos-pregunta (el texto de la carta termina en "?"): el receptor puede escribir
-- y enviar su respuesta en vez de solo avisar "ya lo hice". Se guarda aquí y se le
-- muestra a quien mandó la carta al momento de confirmar (lib/actions/cartas.ts).

alter table public.cartas_asignadas
  add column if not exists respuesta_texto text;
