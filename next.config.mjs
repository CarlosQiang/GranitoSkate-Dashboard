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
      'images.unsplash.com',
      'plus.unsplash.com',
      'tailwindui.com'
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client', 'pg'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  // Configuración para manejar errores de Shopify API
  onDemandEntries: {
    // Período en ms en el que la página se mantendrá en memoria
    maxInactiveAge: 25 * 1000,
    // Número de páginas que se mantendrán en memoria
    pagesBufferLength: 2,
  },
}

export default nextConfig
