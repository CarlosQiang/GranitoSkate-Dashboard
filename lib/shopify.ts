import { GraphQLClient } from "graphql-request"

// Obtener las credenciales de Shopify desde las variables de entorno
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""
const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN || ""

// Verificar si las credenciales están configuradas
const areCredentialsConfigured = shopifyDomain && shopifyAccessToken

// Crear el cliente GraphQL para Shopify
let shopifyClient: GraphQLClient | null = null

if (areCredentialsConfigured) {
  shopifyClient = new GraphQLClient(`https://${shopifyDomain}/admin/api/2023-10/graphql.json`, {
    headers: {
      "X-Shopify-Access-Token": shopifyAccessToken,
      "Content-Type": "application/json",
    },
  })
}

// Función para realizar consultas GraphQL a Shopify
export async function shopifyFetch({ query, variables = {} }) {
  try {
    // Verificar que las credenciales estén configuradas
    if (!shopifyDomain) {
      console.error("Error: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      return {
        data: null,
        errors: [{ message: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado" }],
      }
    }

    if (!shopifyAccessToken) {
      console.error("Error: SHOPIFY_ACCESS_TOKEN no está configurado")
      return {
        data: null,
        errors: [{ message: "SHOPIFY_ACCESS_TOKEN no está configurado" }],
      }
    }

    if (!shopifyClient) {
      console.error("Error: Cliente de Shopify no inicializado")
      return {
        data: null,
        errors: [{ message: "Cliente de Shopify no inicializado" }],
      }
    }

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

    // Verificar si el error es debido a una respuesta HTML en lugar de JSON
    if (error.response?.text && error.response.text.includes("<!DOCTYPE")) {
      console.error("Recibida respuesta HTML en lugar de JSON. Posible error de servidor o redirección.")
      return {
        data: null,
        errors: [
          {
            message:
              "Recibida respuesta HTML en lugar de JSON. Verifica la configuración de Shopify y las credenciales.",
          },
        ],
      }
    }

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

// Función para formatear IDs de Shopify
export function formatShopifyId(id: string, type: string): string {
  if (!id) return `gid://shopify/${type}/0`

  if (id.includes("gid://shopify/")) {
    return id
  }
  return `gid://shopify/${type}/${id}`
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

// Exportar el cliente como default y también como exportación nombrada
export { shopifyClient }
export default shopifyClient
