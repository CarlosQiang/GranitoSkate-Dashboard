import { GraphQLClient } from "graphql-request"

// Crear un cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient("/api/shopify/proxy", {
  headers: {
    "Content-Type": "application/json",
  },
})

// Función para formatear correctamente los IDs de Shopify
export function formatShopifyId(id: string, type = "Product") {
  if (id.startsWith("gid://")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}

// Función para extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid: string): string {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

export default shopifyClient
