import { Logger } from "next-axiom"

const logger = new Logger({
  source: "shopify-client",
})

// Función para obtener la URL base
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  // Usar NEXT_PUBLIC_APP_URL como primera opción si está disponible
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  return process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

// Función para realizar consultas GraphQL a Shopify
export async function shopifyFetch({ query, variables = {} }) {
  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      throw new Error(
        "Faltan credenciales de Shopify. Verifica las variables de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
      )
    }

    // Construir la URL de la API directamente
    const endpoint = `https://${shopDomain}/admin/api/2023-10/graphql.json`

    logger.debug("Enviando consulta GraphQL a Shopify", {
      endpoint,
      queryPreview: query.substring(0, 100) + "...",
    })

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      logger.error(`Error en la solicitud a Shopify (${response.status})`, { text })
      throw new Error(`Error en la solicitud a Shopify (${response.status}): ${text}`)
    }

    const json = await response.json()

    if (json.errors) {
      logger.error("Errores en la respuesta de Shopify", { errors: json.errors })
      throw new Error(`Errores en la respuesta de Shopify: ${JSON.stringify(json.errors)}`)
    }

    return json
  } catch (error) {
    logger.error("Error en shopifyFetch", { error: error instanceof Error ? error.message : "Error desconocido" })
    throw error
  }
}

// Función para realizar una petición REST a Shopify
export async function shopifyRestFetch(endpoint, method = "GET", data = null) {
  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      throw new Error(
        "Faltan credenciales de Shopify. Verifica las variables de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN.",
      )
    }

    // Construir la URL de la API REST directamente
    const apiVersion = "2023-10"
    const url = `https://${shopDomain}/admin/api/${apiVersion}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: data ? JSON.stringify(data) : undefined,
    }

    logger.debug(`Enviando petición REST ${method} a Shopify`, { endpoint })

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`Error en la respuesta REST de Shopify (${response.status})`, { errorText })
      throw new Error(`Error en la respuesta de Shopify: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    logger.error("Error en la petición REST a Shopify", {
      endpoint,
      method,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid: string): string {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

// Mejorar la función formatShopifyId para manejar todos los casos posibles
export function formatShopifyId(id: string | number | null | undefined, resourceType: string): string {
  if (!id) {
    logger.warn(`ID inválido proporcionado para ${resourceType}`, { id })
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
    // Verificar que las variables de entorno estén configuradas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain) {
      return {
        success: false,
        message: "Error de configuración: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN o SHOPIFY_STORE_DOMAIN no está definido",
      }
    }

    if (!accessToken) {
      return {
        success: false,
        message: "Error de configuración: SHOPIFY_ACCESS_TOKEN no está definido",
      }
    }

    const query = `
      query {
        shop {
          name
          id
          myshopifyDomain
          plan {
            displayName
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    return {
      success: true,
      data: response.data,
      message: `Conexión exitosa con la tienda ${response.data?.shop?.name || "Shopify"}`,
    }
  } catch (error) {
    logger.error("Error al probar la conexión con Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return {
      success: false,
      message:
        error instanceof Error
          ? `Error al conectar con Shopify: ${error.message}`
          : "Error desconocido al conectar con Shopify",
    }
  }
}

// Exportar un cliente por defecto
const shopifyClient = {
  shopifyFetch,
  shopifyRestFetch,
  extractIdFromGid,
  formatShopifyId,
  testShopifyConnection,
  getBaseUrl,
}

export default shopifyClient
