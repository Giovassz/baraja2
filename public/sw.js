/* Service worker propio de Baraja2 (sin next-pwa) — estrategias estilo Workbox */
/* Implementa BJ2-006 (app shell + offline) y BJ2-038 (recepción de Web Push) */

const VERSION = 'baraja2-v1';
const CACHE_SHELL = `${VERSION}-shell`;
const CACHE_ASSETS = `${VERSION}-assets`;
const CACHE_PAGINAS = `${VERSION}-paginas`;

// Recursos mínimos para que la app abra sin conexión
const RECURSOS_SHELL = [
  '/',
  '/sin-conexion',
  '/manifest.json',
  '/icons/icono-192.png',
  '/icons/icono-512.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) => cache.addAll(RECURSOS_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => !clave.startsWith(VERSION))
            .map((clave) => caches.delete(clave)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/**
 * Estrategia stale-while-revalidate: responde de caché al instante y
 * actualiza la copia en segundo plano.
 */
async function staleWhileRevalidate(request, nombreCache) {
  const cache = await caches.open(nombreCache);
  const enCache = await cache.match(request);
  const red = fetch(request)
    .then((respuesta) => {
      if (respuesta && respuesta.status === 200 && respuesta.type === 'basic') {
        cache.put(request, respuesta.clone());
      }
      return respuesta;
    })
    .catch(() => undefined);
  return enCache || (await red) || Response.error();
}

/**
 * Estrategia network-first para navegaciones: intenta la red y si falla
 * devuelve la última copia cacheada o la página sin conexión.
 */
async function networkFirstPaginas(request) {
  const cache = await caches.open(CACHE_PAGINAS);
  try {
    const respuesta = await fetch(request);
    if (respuesta && respuesta.status === 200) {
      cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    const enCache = await cache.match(request);
    if (enCache) return enCache;
    const offline = await caches.match('/sin-conexion');
    return offline || Response.error();
  }
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // No cachear llamadas a la API ni a Supabase (siempre datos frescos)
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    evento.respondWith(networkFirstPaginas(request));
    return;
  }

  if (
    ['style', 'script', 'font', 'image'].includes(request.destination) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    evento.respondWith(staleWhileRevalidate(request, CACHE_ASSETS));
    return;
  }
});

// --- Web Push (BJ2-038) ---------------------------------------------------

self.addEventListener('push', (evento) => {
  let datos = {
    titulo: 'Baraja2',
    cuerpo: 'Tienes novedades en tu baraja.',
    url: '/dashboard',
  };
  try {
    if (evento.data) {
      datos = { ...datos, ...evento.data.json() };
    }
  } catch {
    if (evento.data) datos.cuerpo = evento.data.text();
  }

  evento.waitUntil(
    self.registration.showNotification(datos.titulo, {
      body: datos.cuerpo,
      icon: '/icons/icono-192.png',
      badge: '/icons/icono-192.png',
      lang: 'es-MX',
      data: { url: datos.url },
      tag: datos.tag || 'baraja2',
      renotify: true,
    }),
  );
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const destino = (evento.notification.data && evento.notification.data.url) || '/dashboard';
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientes) => {
      const abierto = clientes.find((c) => c.url.includes(destino));
      if (abierto) return abierto.focus();
      return self.clients.openWindow(destino);
    }),
  );
});
