/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'placeholder.com', 'via.placeholder.com', 'burst.shopifycdn.com', 'plus.unsplash.com', 'images.unsplash.com'],
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
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" 
      ? {
          exclude: ["error", "warn"],
        } 
      : false,
  },
  transpilePackages: ["graphql-request"],
};

export default nextConfig;
