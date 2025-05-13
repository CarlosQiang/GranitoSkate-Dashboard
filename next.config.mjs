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
    domains: ['cdn.shopify.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Configuración de rutas
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard/overview',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: true,
      },
    ]
  },
  // Configuración para ignorar errores de dependencias
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
