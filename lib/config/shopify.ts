// Función para obtener la configuración de Shopify desde las variables de entorno
export function getShopifyConfig() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || ""
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || ""
  const apiVersion = "2023-07" // Versión de la API de Shopify

  // Construir la URL de la API GraphQL
  const apiUrl = domain ? `https://${domain}/admin/api/${apiVersion}/graphql.json` : process.env.SHOPIFY_API_URL || ""

  return {
    domain,
    accessToken,
    apiUrl,
    apiVersion,
  }
}

// Función para validar la configuración de Shopify
export function validateShopifyConfig() {
  const config = getShopifyConfig()

  const errors = []

  if (!config.domain) {
    errors.push("Falta el dominio de la tienda Shopify")
  }

  if (!config.accessToken) {
    errors.push("Falta el token de acceso de Shopify")
  }

  if (!config.apiUrl) {
    errors.push("Falta la URL de la API de Shopify")
  }

  return {
    isValid: errors.length === 0,
    errors,
    config,
  }
}

// Función para construir los encabezados de autenticación para las solicitudes a Shopify
export function getShopifyHeaders() {
  const { accessToken } = getShopifyConfig()

  return {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  }
}
