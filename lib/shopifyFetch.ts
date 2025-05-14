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

export default shopifyClient
