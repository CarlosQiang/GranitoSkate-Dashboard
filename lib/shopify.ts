import { GraphQLClient } from "graphql-request"
import { shopifyConfig } from "./config/shopify"

// Función para obtener la URL base
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000"
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
    // Verificar que las variables de entorno estén configuradas
    if (!shopifyConfig.apiUrl || !shopifyConfig.accessToken) {
      console.error("Error: Faltan credenciales de Shopify")
      throw new Error(
        "Faltan credenciales de Shopify. Verifica las variables de entorno SHOPIFY_API_URL y SHOPIFY_ACCESS_TOKEN.",
      )
    }

    // Realizar la consulta a Shopify a través del proxy
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

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const text = await response.text()
      console.error(`Error en la solicitud a Shopify (${response.status})`, { text })
      throw new Error(`Error en la solicitud a Shopify (${response.status}): ${text}`)
    }

    // Parsear la respuesta como JSON
    const json = await response.json()

    // Verificar si hay errores en la respuesta
    if (json.errors) {
      console.error("Errores en la respuesta de Shopify", { errors: json.errors })
      throw new Error(`Errores en la respuesta de Shopify: ${JSON.stringify(json.errors)}`)
    }

    return json
  } catch (error) {
    console.error("Error en shopifyFetch", { error })
    throw error
  }
}

// Función para realizar una petición REST a Shopify
export async function shopifyRestFetch(endpoint, method = "GET", data = null) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      console.error("Error: Faltan credenciales de Shopify")
      throw new Error(
        "Faltan credenciales de Shopify. Verifica las variables de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
      )
    }

    // Construir la URL de la API de Shopify
    const url = `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`

    // Configurar las opciones de la petición
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyConfig.accessToken,
      },
      body: data ? JSON.stringify(data) : undefined,
    }

    // Realizar la petición a Shopify
    const response = await fetch(url, options)

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const text = await response.text()
      console.error(`Error en la respuesta REST de Shopify (${response.status})`, { text })
      throw new Error(`Error en la respuesta de Shopify: ${response.status} ${response.statusText}`)
    }

    // Parsear la respuesta como JSON
    return await response.json()
  } catch (error) {
    console.error("Error en la petición REST a Shopify", { error })
    throw error
  }
}

// Extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid) {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

// Formatear un ID para Shopify
export function formatShopifyId(id, resourceType) {
  if (!id) return `gid://shopify/${resourceType}/0`

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
              data: { shop: { name: shopifyConfig.shopDomain.split(".")[0] } },
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

export default shopifyClient
