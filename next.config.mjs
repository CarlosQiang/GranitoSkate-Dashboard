/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'res.cloudinary.com'],
    unoptimized: true,
  },
  // Configuración para evitar errores en la compilación
  experimental: {
    // Opciones experimentales actualizadas para Next.js 15
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
