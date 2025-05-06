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
    serverActions: true,
  },
  // Aumentar el tiempo de timeout para las rutas API
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
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
