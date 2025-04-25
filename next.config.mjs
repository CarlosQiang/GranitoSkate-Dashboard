/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['qiangtheme.myshopify.com', 'cdn.shopify.com'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "qiangtheme.myshopify.com",
  },
}

export default nextConfig
