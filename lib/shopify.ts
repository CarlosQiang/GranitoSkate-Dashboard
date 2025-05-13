import { GraphQLClient } from "graphql-request"

// Función para obtener la URL base
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

// Crear un cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(`${getBaseUrl()}/api/shopify/proxy`, {
  headers: {
    "Content-Type": "application/json",
  },
})

// Función para realizar consultas GraphQL a Shopify
export async function shopifyFetch({ query, variables = {} }) {
  try {
    console.log("Enviando consulta GraphQL a Shopify:", {
      query: query.substring(0, 100) + "...", // Solo para logging, truncamos la consulta
      variables,
    })

    const result = await shopifyClient.request(query, variables)

    // Verificar si la respuesta contiene datos
    if (!result) {
      console.error("Respuesta vacía de Shopify")
      return {
        data: null,
        errors: [{ message: "Respuesta vacía de la API de Shopify" }],
      }
    }

    return { data: result, errors: null }
  } catch (error) {
    console.error("Error en la consulta GraphQL:", error)

    // Intentar extraer errores específicos de GraphQL
    const graphQLErrors = error.response?.errors || [{ message: error.message }]

    // Registrar detalles adicionales para depuración
    if (error.response) {
      console.error("Detalles de la respuesta de error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        errors: graphQLErrors,
      })
    }

    return {
      data: null,
      errors: graphQLErrors,
    }
  }
}

// Mejorar la función formatShopifyId para manejar todos los casos posibles
export function formatShopifyId(id: string | number | null | undefined, resourceType: string): string {
  if (!id) {
    console.warn(`ID inválido proporcionado para ${resourceType}:`, id)
    return `gid://shopify/${resourceType}/0` // ID por defecto para evitar errores
  }

  // Si el ID ya tiene el formato correcto, devolverlo tal cual
  if (typeof id === "string" && id.startsWith(`gid://shopify/${resourceType}/`)) {
    return id
  }

  // Si el ID es un número o una cadena que representa un número
  const idStr = String(id)

  // Si el ID ya contiene el prefijo gid://shopify/ pero no el tipo de recurso correcto
  if (idStr.startsWith("gid://shopify/")) {
    const parts = idStr.split("/")
    const numericId = parts[parts.length - 1]
    return `gid://shopify/${resourceType}/${numericId}`
  }

  // Si el ID es solo el número
  return `gid://shopify/${resourceType}/${idStr}`
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

// Exportar el cliente de Shopify
export default shopifyClient
