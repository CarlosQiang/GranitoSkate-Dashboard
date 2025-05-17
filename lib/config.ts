// Configuración centralizada para la aplicación
export const config = {
  // Shopify
  shopify: {
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "shpat_92c47a8a5fb5ca7e57...",
    shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "qiangtheme.myshopify.com",
    apiUrl:
      process.env.SHOPIFY_API_URL ||
      (process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
        ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`
        : "https://qiangtheme.myshopify.com/admin/api/2023-07/graphql.json"),
  },

  // Base de datos
  database: {
    url:
      process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://postgres:postgres@localhost:5432/granito",
  },

  // Autenticación
  auth: {
    secret: process.env.NEXTAUTH_SECRET || "tu-secreto-seguro-aqui",
    url:
      process.env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000",
  },

  // Aplicación
  app: {
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000"),
    isDevelopment: process.env.NODE_ENV === "development",
  },
}

// Exportar la configuración como valor predeterminado
export default config
