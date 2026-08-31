-- Da dinamismo a que te usen un plot twist encima (sección 4.4): antes tu carta
-- solo cambiaba de estado en silencio. Ahora se guarda cuándo ya viste el aviso en
-- pantalla, para mostrarte una revelación con botón "Entendido" una sola vez.
alter table cartas_asignadas
  add column if not exists notificado_en timestamptz;
