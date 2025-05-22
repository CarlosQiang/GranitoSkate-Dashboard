// Configuración de Shopify
const shopifyConfig = {
  shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "",
  apiVersion: "2023-07",
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
  apiUrl:
    process.env.SHOPIFY_API_URL ||
    `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
}

// Función para verificar si la configuración de Shopify es válida
export function isShopifyConfigValid(): boolean {
  return !!(shopifyConfig.shopDomain && shopifyConfig.accessToken)
}

// Función para obtener los errores de configuración de Shopify
export function getShopifyConfigErrors(): string[] {
  const errors: string[] = []

  if (!shopifyConfig.shopDomain) {
    errors.push("Falta la variable de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
  }

  if (!shopifyConfig.accessToken) {
    errors.push("Falta la variable de entorno SHOPIFY_ACCESS_TOKEN")
  }

  return errors
}

// Exportar la configuración
export { shopifyConfig }
