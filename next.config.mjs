/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['cdn.shopify.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/sync/products',
        destination: '/api/sync/productos',
      },
      {
        source: '/api/products',
        destination: '/api/shopify/products',
      },
    ]
  },
}

export default nextConfig
