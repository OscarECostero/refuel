const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
    buildExcludes: [/middleware-manifest\.json$/],
    publicExcludes: ['!robots.txt'],
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  })
  
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    images: {
      domains: ['localhost'],
    },
  }
  
  module.exports = withPWA(nextConfig)