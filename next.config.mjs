/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'placeholder.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Deshabilitar la prerenderización estática para la página de analytics
  exportPathMap: async function (defaultPathMap) {
    delete defaultPathMap['/dashboard/analytics'];
    return defaultPathMap;
  },
};

export default nextConfig;
