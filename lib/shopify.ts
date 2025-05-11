import { GraphQLClient } from "graphql-request"

// Configuración del cliente GraphQL para Shopify usando el proxy
const shopifyClient = new GraphQLClient(
  typeof window === "undefined"
    ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`
    : "/api/shopify/proxy", // Usar el proxy para solicitudes del cliente
  {
    headers: {
      "Content-Type": "application/json",
      // El token de acceso se añade en el servidor a través del proxy
    },
    timeout: 30000, // Aumentar timeout a 30 segundos
  },
)

export default shopifyClient

// Función para verificar la conexión con Shopify
export async function checkShopifyConnection() {
  try {
    // Usar el endpoint de verificación en lugar de hacer la solicitud directamente
    const response = await fetch("/api/shopify/check", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error checking Shopify connection:", error)
    return {
      success: false,
      error: error.message || "Error connecting to Shopify",
    }
  }
}

// Función para formatear IDs de Shopify
export function formatShopifyId(id, type) {
  if (!id) return null
  if (id.includes("gid://shopify/")) return id
  return `gid://shopify/${type}/${id}`
}

// Función para extraer ID numérico de un ID de Shopify
export function extractIdFromGid(gid) {
  if (!gid) return null
  if (!gid.includes("gid://shopify/")) return gid
  return gid.split("/").pop()
}
