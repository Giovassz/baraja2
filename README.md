# Baraja2

PWA para parejas: cada semana reciben 5 cartas que canjean por retos/beneficios, suman
puntos y desbloquean plot twists. Tres modalidades de relación (Distancia / Híbrida /
Física) y un modo opcional para adultos (Spicy).

> Este repositorio implementa las **fases 0 a 10** del Backlog de Desarrollo (`BJ2-001` a
> `BJ2-060`). La fase 11 no se implementa. La fase 9 (monetización) deja la tabla
> `suscripciones` creada pero sin lógica de cobro.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript estricto |
| Estilos | Tailwind CSS con tokens de marca (`tailwind.config.ts`) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Mutaciones | Server Actions + validación `zod`; lógica atómica en funciones de Postgres |
| Cron | `/api/cron/reinicio-semanal` (Vercel Cron, ver `vercel.json`) |
| Push | Web Push (VAPID) vía `web-push` |
| PWA | `public/manifest.json` + `public/sw.js` (service worker propio, sin `next-pwa`) |
| Pruebas | `vitest` (lógica de negocio) · `playwright` (e2e) |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena los valores
```

### 1. Supabase

```bash
# Local (requiere Docker):
npx supabase start
npx supabase db reset          # aplica supabase/migrations/*

# O contra un proyecto en la nube:
npx supabase link --project-ref <ref>
npx supabase db push
```

Copia en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` (misma pantalla; solo servidor)

### 2. Catálogo de contenido

El contenido final de las cartas y plot twists (`BJ2-046`..`049`) lo entrega el equipo de
producto. Mientras tanto `seed/catalogo.json` trae contenido **de prueba** claramente
marcado. Para cargarlo:

```bash
node --env-file=.env.local --import tsx scripts/importar-catalogo.ts
# o, con el contenido final:
node --env-file=.env.local --import tsx scripts/importar-catalogo.ts ruta/al/catalogo.json --reemplazar
```

El script valida el archivo con `zod` estricto (sección 4.6 del prompt maestro) y aborta
sin insertar nada si el formato no cumple.

### 3. Web Push (VAPID)

```bash
npx web-push generate-vapid-keys
```

Guarda la pública en `NEXT_PUBLIC_VAPID_PUBLIC_KEY` y la privada en `VAPID_PRIVATE_KEY`.

### 4. Cron

En Vercel, define la variable `CRON_SECRET`. `vercel.json` ya programa el reinicio diario a
las 06:00 UTC. Para dispararlo a mano:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<tu-app>/api/cron/reinicio-semanal
```

## Scripts

```bash
npm run dev                # desarrollo
npm run build              # build de producción (criterio de aceptación fase 0)
npm test                   # pruebas unitarias de lib/reglas
npm run test:e2e           # pruebas end-to-end (necesita la app corriendo)
```

## Estructura

```
app/            rutas (auth · onboarding · app · api)
components/     widgets/ (dashboard) · ui/ (sistema de diseño) · pwa/
lib/
  actions/      Server Actions por dominio
  reglas/       lógica de negocio pura y testeable
  validaciones/ esquemas zod
  supabase/     clientes server/browser/admin + tipos
supabase/migrations/   una migración por tabla + RPCs de mecánica
scripts/        importar-catalogo.ts
seed/           catalogo.json (PRUEBA)
tests/          reglas/ (vitest) · e2e/ (playwright)
```

## Pendientes que dependen del equipo

- Contenido final del catálogo (`seed/catalogo.json`).
- Ilustraciones finales de avatares en `public/avatares/*.svg` (hay placeholders).
- Íconos PWA definitivos en `public/icons/` (hay placeholders generados).
- Crear el proyecto Supabase y el proyecto Vercel; cargar variables de entorno.
- Fase 9 (monetización): activar la lógica de cobro cuando producto lo indique.
