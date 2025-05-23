import { GraphQLClient } from "graphql-request"
import config from "./config"

// Función para obtener la URL base
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return config.app.url
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

    // IMPORTANTE: Siempre usamos el proxy del servidor en lugar de conectarnos directamente a Shopify
    const response = await fetch(`${getBaseUrl()}/api/shopify/proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`Error en la respuesta del proxy de Shopify (${response.status}):`, text)
      throw new Error(`Error en la respuesta del proxy de Shopify (${response.status}): ${text}`)
    }

    const result = await response.json()

    // Verificar si la respuesta contiene datos
    if (!result) {
      console.error("Respuesta vacía del proxy de Shopify")
      return {
        data: null,
        errors: [{ message: "Respuesta vacía del proxy de Shopify" }],
      }
    }

    // Verificar si la respuesta contiene errores
    if (result.errors) {
      console.error("Errores en la respuesta del proxy de Shopify:", result.errors)
      return result
    }

    return result
  } catch (error) {
    console.error("Error en shopifyFetch:", error)

    // Devolver un objeto de error estructurado
    return {
      data: null,
      errors: [
        {
          message: error instanceof Error ? error.message : "Error desconocido en shopifyFetch",
        },
      ],
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
export async function testShopifyConnection(tolerant = false) {
  try {
    // Si estamos en modo tolerante, intentamos una consulta más simple
    // que podría funcionar incluso con tokens con permisos limitados
    const query = tolerant
      ? `
        query {
          shop {
            name
          }
        }
      `
      : `
        query {
          shop {
            name
            id
            url
          }
        }
      `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      // Extraer mensaje de error más específico
      let errorMessage = "Error desconocido al conectar con Shopify"

      if (response.errors[0]) {
        if (response.errors[0].message.includes("401")) {
          errorMessage = "Error de autenticación: Token de acceso inválido o expirado"
        } else if (response.errors[0].message.includes("404")) {
          errorMessage = "Error: Tienda no encontrada. Verifique el dominio de la tienda"
        } else {
          errorMessage = response.errors[0].message
        }
      }

      // Si estamos en modo tolerante, intentamos una consulta alternativa
      // que podría funcionar con diferentes permisos
      if (tolerant) {
        try {
          // Intentar una consulta a productos que podría funcionar con diferentes permisos
          const altQuery = `
            query {
              products(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          `

          const altResponse = await shopifyFetch({ query: altQuery })

          if (!altResponse.errors) {
            return {
              success: true,
              data: { shop: { name: config.shopify.shopDomain.split(".")[0] } },
              message: "Conexión alternativa exitosa",
            }
          }
        } catch (e) {
          console.warn("Error en consulta alternativa:", e)
        }
      }

      return {
        success: false,
        data: null,
        message: errorMessage,
      }
    }

    return {
      success: true,
      data: response.data,
      message: `Conexión exitosa con la tienda ${response.data?.shop?.name || "Shopify"}`,
    }
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)
    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? `Error al conectar con Shopify: ${error.message}`
          : "Error desconocido al conectar con Shopify",
    }
  }
}

// Extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid: string): string {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

// Exportar el cliente de Shopify como exportación por defecto
export default shopifyClient
