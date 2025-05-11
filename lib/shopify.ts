import { GraphQLClient } from "graphql-request"

// Determinar la URL base para las solicitudes a la API
const getApiUrl = () => {
  // Si estamos en el servidor y tenemos la URL de la API de Shopify directamente
  if (typeof window === "undefined" && process.env.SHOPIFY_API_URL) {
    return process.env.SHOPIFY_API_URL
  }

  // En producción, usar la URL de la API
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/shopify/proxy`
  }

  // En desarrollo, usar la URL local
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/shopify/proxy`
  }

  // Fallback a localhost
  return "http://localhost:3000/api/shopify/proxy"
}

// Crear el cliente GraphQL con opciones mejoradas
const shopifyClient = new GraphQLClient(getApiUrl(), {
  headers: {},
  timeout: 30000, // 30 segundos de timeout
  fetch: (url, options) => {
    // Añadir cache: 'no-store' para evitar problemas de caché
    return fetch(url, { ...options, cache: "no-store" })
  },
})

// Función para formatear correctamente los IDs de Shopify
export function formatShopifyId(id: string, type = "Product") {
  if (id.startsWith("gid://")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
}

// Function to get the base URL
function getBaseUrl() {
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
    const response = await fetch(`${getBaseUrl()}/api/shopify/check`, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      next: { revalidate: 0 },
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

// Función para verificar y configurar las credenciales de Shopify
export async function configureShopifyClient() {
  // Verificar si estamos en el cliente
  if (typeof window !== "undefined") {
    return shopifyClient
  }

  // En el servidor, podemos acceder directamente a las variables de entorno
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

  if (!shopDomain || !accessToken) {
    console.warn("Faltan credenciales de Shopify")
    return shopifyClient
  }

  // Configurar el cliente con las credenciales correctas
  const apiUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`

  return new GraphQLClient(apiUrl, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
    },
    timeout: 30000,
  })
}

// Exportar el cliente de Shopify
export default shopifyClient
