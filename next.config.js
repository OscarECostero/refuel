const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest\.json$/],
    publicExcludes: ['!robots.txt'],
    swSrc: 'worker/index.js'
  })
  
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    images: {
      domains: ['localhost'],
    },
  }
  
  module.exports = withPWA(nextConfig)