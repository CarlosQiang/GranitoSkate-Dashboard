/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.shopify.com", "images.unsplash.com"],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
    externalDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Configuración para manejar archivos sin extensión
    config.module.rules.push({
      test: /\.tsx?$/,
      use: "ts-loader",
      exclude: /node_modules/,
    })

    return config
  },
}

module.exports = nextConfig
