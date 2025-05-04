import { GraphQLClient } from "graphql-request"

// Función para obtener la URL base de la aplicación
const getBaseUrl = () => {
  // En el navegador, usamos window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // En el servidor, usamos la URL de Vercel o localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

// Crear el cliente GraphQL que usa nuestro proxy en lugar de conectarse directamente a Shopify
const shopifyClient = new GraphQLClient(`${getBaseUrl()}/api/shopify/proxy`, {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 segundos de timeout para operaciones largas
})

// Función para formatear correctamente los IDs de Shopify
export function formatShopifyId(id: string, type = "Product") {
  if (id.startsWith("gid://")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}

// Función para realizar una consulta de prueba a Shopify
export async function testShopifyConnection() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/shopify/proxy`, {
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

// Exportar el cliente de Shopify
export default shopifyClient

// Función para obtener el cliente de Shopify (para compatibilidad con código existente)
export const getShopifyApi = async () => {
  return shopifyClient
}
