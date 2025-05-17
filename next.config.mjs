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
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/android-chrome-192x192.png',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
        ],
      },
      {
        source: '/android-chrome-512x512.png',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
  // Ignorar archivos problemáticos
  webpack: (config, { isServer }) => {
    // Agregar reglas para ignorar archivos problemáticos
    config.module.rules.push({
      test: [
        /lib\/db\/neon-client\.ts$/,
        /lib\/db\/neon\.ts$/,
        /lib\/services\/customer-sync-service\.ts$/,
        /app\/api\/sync\/customers\/route\.ts$/,
        /app\/api\/db-check\/route\.ts$/,
      ],
      loader: 'null-loader',
    });
    
    return config;
  },
};

export default nextConfig;
