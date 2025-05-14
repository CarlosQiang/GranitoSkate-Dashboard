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

const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || ""

if (!shopDomain) {
  console.error("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
}

if (!accessToken) {
  console.error("SHOPIFY_ACCESS_TOKEN no está configurado")
}

// Crear un cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
  headers: {
    "X-Shopify-Access-Token": accessToken,
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
export async function testShopifyConnection(tolerant = false) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) {
      return {
        success: false,
        data: null,
        message: "Error de configuración: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está definido",
      }
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      return {
        success: false,
        data: null,
        message: "Error de configuración: SHOPIFY_ACCESS_TOKEN no está definido",
      }
    }

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
              data: { shop: { name: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN.split(".")[0] } },
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

// Exportar el cliente de Shopify
export default shopifyClient
