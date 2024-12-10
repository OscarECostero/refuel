import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

const manifestEntries = self.__WB_MANIFEST.filter(entry => 
  !entry.url.includes('app-build-manifest.json')
);

precacheAndRoute(manifestEntries)

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages'
  })
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images'
  })
)

registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
)

self.addEventListener('install', () => {
  console.log('Service Worker installed')
})

self.addEventListener('activate', () => {
  console.log('Service Worker activated')
})