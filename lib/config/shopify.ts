// Configuración centralizada para Shopify
export const shopifyConfig = {
  // Construir la URL de la API de Shopify a partir del dominio de la tienda
  apiUrl:
    process.env.SHOPIFY_API_URL ||
    (process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`
      : null),
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
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
      "SHOPIFY_API_URL no está configurado. Se intentará construir a partir de NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN.",
    )
  }

  if (!shopifyConfig.accessToken) {
    errors.push("SHOPIFY_ACCESS_TOKEN no está configurado.")
  }

  if (!shopifyConfig.shopDomain) {
    errors.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado.")
  }

  return errors
}
