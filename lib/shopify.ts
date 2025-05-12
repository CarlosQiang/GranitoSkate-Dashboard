import { GraphQLClient } from "graphql-request"

// Crear un cliente GraphQL para Shopify que use nuestro proxy interno
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

// Función para obtener la URL base
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

// Función para realizar una consulta de prueba a Shopify
export async function testShopifyConnection() {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/shopify/check`, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      return {
        success: true,
        data: { shop: { name: data.shopName } },
        message: data.message,
      }
    } else {
      throw new Error(data.error || "Error desconocido")
    }
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid: string): string {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

// Función para obtener el cliente de Shopify (para compatibilidad con código existente)
export const getShopifyApi = async () => {
  return shopifyClient
}

// Exportar el cliente de Shopify
export default shopifyClient
