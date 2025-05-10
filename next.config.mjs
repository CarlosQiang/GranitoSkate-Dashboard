/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'placeholder.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  experimental: {
    // Corregido: debe ser un objeto, no un booleano
    serverActions: {
      allowedOrigins: ["localhost:3000", "granito-skate-dashboard.vercel.app"]
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración para mejorar el rendimiento
  poweredByHeader: false,
}

export default nextConfig
