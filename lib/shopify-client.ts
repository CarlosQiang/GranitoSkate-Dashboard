import { GraphQLClient } from "graphql-request"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "shopify-client",
})

// Modificar la función getBaseUrl para asegurar que siempre devuelva una URL válida
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

// Crear un cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(`${getBaseUrl()}/api/shopify`, {
  headers: {
    "Content-Type": "application/json",
  },
})

// Modificar la función shopifyFetch para mejorar el manejo de errores y logging
export async function shopifyFetch({ query, variables = {} }) {
  try {
    // Verificar si estamos usando las variables de entorno correctas
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      console.error("Faltan credenciales de Shopify:", {
        shopDomain: !!shopDomain,
        accessToken: !!accessToken,
      })
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
    const baseUrl = `${getBaseUrl()}/api/shopify/rest`
    const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
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
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) {
      return {
        success: false,
        message: "Error de configuración: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está definido",
      }
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
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

      return {
        success: false,
        message: errorMessage,
      }
    }

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

export default shopifyClient
