/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'placeholder.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  experimental: {
    // Fix the serverActions format
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
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
