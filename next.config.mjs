/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'res.cloudinary.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Configuración para manejar archivos de texto
    config.module.rules.push({
      test: /\.txt$/,
      use: 'raw-loader',
    })
    return config
  },
}

export default nextConfig
