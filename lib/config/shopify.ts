// Configuración centralizada para Shopify
export const shopifyConfig = {
  // Construir la URL de la API de Shopify a partir del dominio de la tienda
  apiUrl:
    process.env.SHOPIFY_API_URL ||
    (process.env.SHOPIFY_STORE_DOMAIN
      ? `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/graphql.json`
      : process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
        ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`
        : null),

  // Token de acceso a la API de Shopify
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN,

  // Dominio de la tienda Shopify
  shopDomain: process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,

  // Versión de la API de Shopify
  apiVersion: "2023-07",
}

// Función para verificar si la configuración de Shopify es válida
export function isShopifyConfigValid() {
  return Boolean(shopifyConfig.apiUrl && shopifyConfig.accessToken && shopifyConfig.shopDomain)
}

// Función para obtener mensajes de error de configuración
export function getShopifyConfigErrors() {
  const errors = []

  if (!shopifyConfig.apiUrl) {
    errors.push(
      "SHOPIFY_API_URL no está configurado. Se intentará construir a partir de SHOPIFY_STORE_DOMAIN o NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN.",
    )
  }

  if (!shopifyConfig.accessToken) {
    errors.push("SHOPIFY_ACCESS_TOKEN no está configurado.")
  }

  if (!shopifyConfig.shopDomain) {
    errors.push("SHOPIFY_STORE_DOMAIN o NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado.")
  }

  return errors
}

// Función para obtener la URL de la API REST de Shopify
export function getShopifyRestUrl(endpoint: string) {
  if (!shopifyConfig.shopDomain) {
    throw new Error("Dominio de Shopify no configurado")
  }

  // Asegurarse de que el endpoint comience con /
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

  return `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}${formattedEndpoint}`
}
