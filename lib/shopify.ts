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

// Configuración del cliente GraphQL para Shopify a través del proxy
const shopifyClient = new GraphQLClient(`${getBaseUrl()}/api/shopify`, {
  headers: {
    "Content-Type": "application/json",
  },
  // Añadir un timeout para evitar que las solicitudes se queden colgadas
  timeout: 30000, // 30 segundos
})

// Función para verificar la conexión con Shopify
export async function checkShopifyConnection() {
  try {
    const query = `
      {
        shop {
          name
        }
      }
    `
    const data = await shopifyClient.request(query)
    return {
      success: true,
      shopName: data.shop.name,
    }
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export default shopifyClient
