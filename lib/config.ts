const config = {
  app: {
    name: "GestionGranito",
    description: "Panel de administración para Granito Skateshop",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    isDevelopment: process.env.NODE_ENV === "development",
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET || "tu_secreto_aqui",
    debug: process.env.NODE_ENV === "development",
  },
  database: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    directUrl: process.env.DIRECT_URL,
  },
  shopify: {
    shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "",
    apiUrl: process.env.SHOPIFY_API_URL || "https://api.shopify.com",
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
  },
}

export default config
