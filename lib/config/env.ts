// Configuración centralizada para variables de entorno
export const envConfig = {
  // Shopify
  shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN,
  shopifyShopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
  shopifyApiUrl:
    process.env.SHOPIFY_API_URL ||
    (process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`
      : null),

  // Base de datos
  databaseUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL,

  // Autenticación
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,

  // Aplicación
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000",

  // Modo de desarrollo
  isDevelopment: process.env.NODE_ENV === "development",

  // Valores predeterminados para desarrollo
  getDefaultIfDev: (value: string | undefined, defaultValue: string): string => {
    if (process.env.NODE_ENV === "development" && !value) {
      console.warn(`Variable de entorno no configurada, usando valor predeterminado para desarrollo: ${defaultValue}`)
      return defaultValue
    }
    return value || ""
  },
}

// Función para verificar si la configuración de Shopify es válida
export function isShopifyConfigValid() {
  return Boolean(envConfig.shopifyApiUrl && envConfig.shopifyAccessToken && envConfig.shopifyShopDomain)
}

// Función para obtener mensajes de error de configuración
export function getConfigErrors() {
  const errors = []

  if (!envConfig.shopifyApiUrl) {
    errors.push("SHOPIFY_API_URL no está configurado.")
  }

  if (!envConfig.shopifyAccessToken) {
    errors.push("SHOPIFY_ACCESS_TOKEN no está configurado.")
  }

  if (!envConfig.shopifyShopDomain) {
    errors.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado.")
  }

  if (!envConfig.databaseUrl) {
    errors.push("DATABASE_URL o POSTGRES_URL no está configurado.")
  }

  if (!envConfig.nextAuthSecret) {
    errors.push("NEXTAUTH_SECRET no está configurado.")
  }

  return errors
}

// Función para verificar si todas las variables de entorno necesarias están configuradas
export function isConfigValid() {
  return getConfigErrors().length === 0
}

// Exportar valores predeterminados para desarrollo
export const devDefaults = {
  shopifyAccessToken: "shpat_92c47a8a5fb5ca7e57...",
  shopifyShopDomain: "qiangtheme.myshopify.com",
  databaseUrl: "postgresql://user:password@localhost:5432/granito",
  nextAuthSecret: "tu-secreto-seguro-aqui",
}
