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
    domains: ['cdn.shopify.com', 'placeholder.com'],
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
    serverExternalPackages: ['@prisma/client', 'bcrypt'],
  },
};

export default nextConfig;
