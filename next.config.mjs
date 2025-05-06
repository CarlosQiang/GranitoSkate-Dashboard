/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'cdn.shopify.com',
      'burst.shopifycdn.com',
      'plus.unsplash.com',
      'images.unsplash.com',
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,  // Cambiado de boolean a true
  },
  // Eliminada la sección 'api' que no es reconocida
  // Configuración para mejorar el rendimiento
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimización para Vercel
  transpilePackages: ['graphql-request'],
}

export default nextConfig
