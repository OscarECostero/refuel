import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

// Precache y rutas
precacheAndRoute(self.__WB_MANIFEST)

// Ruta para navegación
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages'
  })
)

// Ruta para imágenes
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images'
  })
)

// Ruta para recursos estáticos
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
)

// Eventos básicos
self.addEventListener('install', () => {
  console.log('Service Worker instalado')
})

self.addEventListener('activate', () => {
  console.log('Service Worker activado')
})