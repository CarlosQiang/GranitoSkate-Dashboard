import { GraphQLClient } from "graphql-request"

// Función para formatear IDs de Shopify
export function formatShopifyId(id, type) {
  if (!id) return null

  // Si ya tiene el formato completo, devolverlo tal cual
  if (id.startsWith("gid://shopify/")) {
    return id
  }

  // Si es un ID numérico, formatearlo
  return `gid://shopify/${type}/${id}`
}

// Función para extraer el ID numérico de un ID de Shopify
export function extractShopifyId(fullId) {
  if (!fullId) return null

  // Si ya es un ID simple, devolverlo
  if (!fullId.includes("/")) {
    return fullId
  }

  // Extraer el ID numérico del final
  return fullId.split("/").pop()
}

// Crear cliente GraphQL con manejo de errores mejorado
const createShopifyClient = () => {
  const apiUrl = process.env.SHOPIFY_API_URL
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

  if (!apiUrl || !accessToken) {
    console.error("Error: Faltan variables de entorno para Shopify (SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN)")
    throw new Error("Configuración de Shopify incompleta. Por favor, verifica las variables de entorno.")
  }

  const client = new GraphQLClient(apiUrl, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 segundos de timeout
  })

  // Envolver el método request para añadir logging y manejo de errores
  const originalRequest = client.request.bind(client)
  client.request = async (...args) => {
    const startTime = Date.now()
    try {
      console.log(`Shopify API Request: ${JSON.stringify(args[0]).substring(0, 200)}...`)
      const result = await originalRequest(...args)
      const duration = Date.now() - startTime
      console.log(`Shopify API Response (${duration}ms): Success`)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Shopify API Error (${duration}ms):`, error)

      // Mejorar el mensaje de error para el usuario
      if (error.response?.errors) {
        const errorMessages = error.response.errors.map((e) => e.message).join(", ")
        throw new Error(`Error en la API de Shopify: ${errorMessages}`)
      } else if (error.request) {
        throw new Error(`Error de conexión con Shopify: ${error.message}`)
      } else {
        throw new Error(`Error inesperado: ${error.message}`)
      }
    }
  }

  return client
}

// Exportar el cliente de Shopify
const shopifyClient = createShopifyClient()
export default shopifyClient

// Exportar función para obtener el cliente (útil para testing y mocking)
export function getShopifyClient() {
  return shopifyClient
}
