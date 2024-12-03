import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

self.addEventListener('install', (event) => {
  console.log('🟦 Service Worker: Instalando...', new Date().toLocaleTimeString());
});

self.addEventListener('activate', (event) => {
  console.log('🟩 Service Worker: Activado', new Date().toLocaleTimeString());
});

const logCacheOperation = async (request, cacheName, operation) => {
  console.log(`🔄 ${operation} en caché '${cacheName}':`, {
    url: request.url,
    method: request.method,
    timestamp: new Date().toLocaleTimeString()
  });
};

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.origin === 'https://refuelpickup.com',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      {
        cacheWillUpdate: async ({ request, response }) => {
          await logCacheOperation(request, 'api-cache', 'Guardando respuesta');
          return response;
        },
        cacheDidUpdate: async ({ request }) => {
          await logCacheOperation(request, 'api-cache', 'Actualizado');
        },
        cachedResponseWillBeUsed: async ({ request, cachedResponse }) => {
          console.log('📦 Usando respuesta cacheada para:', {
            url: request.url,
            disponible: !!cachedResponse,
            timestamp: new Date().toLocaleTimeString()
          });
          return cachedResponse;
        }
      },
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
    callbacks: {
      networkTimeoutSeconds: 3,
    }
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

const networkOnly = new NetworkFirst();
const navigationHandler = async (params) => {
  try {
    return await networkOnly.handle(params);
  } catch (error) {
    return caches.match('/offline.html');
  }
};

registerRoute(
  ({ request }) => request.mode === 'navigate',
  navigationHandler
);

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification('Refuel Pickup', options)
  );
});

self.addEventListener('fetch', (event) => {
  console.log('🎯 Fetch interceptado:', {
    url: event.request.url,
    method: event.request.method,
    mode: event.request.mode,
    timestamp: new Date().toLocaleTimeString()
  });
});

self.addEventListener('error', (event) => {
  console.error('❌ Error en Service Worker:', {
    error: event.error,
    timestamp: new Date().toLocaleTimeString()
  });
});

const offlineHandler = async (params) => {
  try {
    const response = await networkOnly.handle(params);
    console.log('✅ Respuesta exitosa:', {
      url: params.request.url,
      status: response.status,
      timestamp: new Date().toLocaleTimeString()
    });
    return response;
  } catch (error) {
    console.log('⚠️ Error de red, intentando usar caché:', {
      url: params.request.url,
      error: error.message,
      timestamp: new Date().toLocaleTimeString()
    });
    
    const cachedResponse = await caches.match(params.request);
    if (cachedResponse) {
      console.log('📦 Encontrado en caché:', {
        url: params.request.url,
        timestamp: new Date().toLocaleTimeString()
      });
      return cachedResponse;
    }
    
    console.log('🔴 No encontrado en caché, mostrando offline.html');
    return caches.match('/offline.html');
  }
};

self.addEventListener('message', async (event) => {
  if (event.data === 'INSPECT_CACHE') {
    const cacheNames = await caches.keys();
    const cacheDetails = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return {
          name,
          entries: keys.length,
          urls: keys.map(request => request.url)
        };
      })
    );
    
    console.log('📊 Estado actual del caché:', cacheDetails);
  }
});