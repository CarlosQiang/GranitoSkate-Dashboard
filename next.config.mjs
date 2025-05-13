/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'res.cloudinary.com'],
    unoptimized: true,
  },
  // Configuración correcta para Next.js 15
  experimental: {},
  // Mover serverComponentsExternalPackages a la raíz como serverExternalPackages
  serverExternalPackages: ['@neondatabase/serverless'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
