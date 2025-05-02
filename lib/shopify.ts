import { GraphQLClient } from "graphql-request"

// Función para obtener la URL base de la API de Shopify
function getShopifyApiUrl() {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  if (!shopDomain) {
    throw new Error("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está definido")
  }
  return `https://${shopDomain}/admin/api/2023-10/graphql.json`
}

// Función para obtener el token de acceso de Shopify
function getShopifyAccessToken() {
  const token = process.env.SHOPIFY_ACCESS_TOKEN
  if (!token) {
    throw new Error("SHOPIFY_ACCESS_TOKEN no está definido")
  }
  return token
}

// Crear y configurar el cliente GraphQL
const shopifyClient = new GraphQLClient(getShopifyApiUrl(), {
  headers: {
    "X-Shopify-Access-Token": getShopifyAccessToken(),
    "Content-Type": "application/json",
  },
})

// Función para formatear IDs de Shopify
export function formatShopifyId(id: string, type: string) {
  if (id.includes(`gid://shopify/${type}/`)) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}

export default shopifyClient
