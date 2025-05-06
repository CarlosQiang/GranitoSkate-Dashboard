/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'placeholder.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "granito-skate-dashboard.vercel.app"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Asegurarse de que los recursos estáticos se sirvan correctamente
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Configuración para el manejo de rutas
  trailingSlash: false,
}

export default nextConfig
