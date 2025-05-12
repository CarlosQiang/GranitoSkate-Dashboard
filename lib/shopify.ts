import { GraphQLClient } from "graphql-request"

// Función para verificar si las variables de entorno están disponibles
export function checkShopifyEnvVars() {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

  const missingVars = []
  if (!shopDomain) missingVars.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN")
  if (!accessToken) missingVars.push("SHOPIFY_ACCESS_TOKEN")

  return {
    isValid: missingVars.length === 0,
    missingVars,
    shopDomain,
    accessToken,
  }
}

// Determinar si estamos en el cliente o en el servidor
const isClient = typeof window !== "undefined"

// Configuración del cliente GraphQL para Shopify
const createShopifyClient = () => {
  const envCheck = checkShopifyEnvVars()

  if (!envCheck.isValid) {
    console.warn(`Faltan variables de entorno para la API de Shopify: ${envCheck.missingVars.join(", ")}`)
    // Devolvemos un cliente que lanzará un error descriptivo cuando se use
    return new GraphQLClient(isClient ? "/api/shopify/proxy" : "https://example.com/invalid", {
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  return new GraphQLClient(
    isClient
      ? "/api/shopify/proxy" // Usar el proxy en el cliente
      : `https://${envCheck.shopDomain}/admin/api/2023-07/graphql.json`, // Usar la API directamente en el servidor
    {
      headers: isClient
        ? {
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": envCheck.accessToken || "",
          },
      timeout: 30000, // 30 segundos
    },
  )
}

const shopifyClient = createShopifyClient()

// Exportar como default para mantener compatibilidad con el código existente
export default shopifyClient

// Función para verificar la conexión con Shopify
export async function checkShopifyConnection() {
  try {
    const envCheck = checkShopifyEnvVars()
    if (!envCheck.isValid) {
      return {
        connected: false,
        error: `Faltan variables de entorno: ${envCheck.missingVars.join(", ")}`,
        missingVars: envCheck.missingVars,
      }
    }

    if (isClient) {
      // En el cliente, usar el endpoint de verificación
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL || "http://localhost:3000"

      const response = await fetch(`${baseUrl}/api/shopify/check`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } else {
      // En el servidor, hacer la consulta directamente
      const query = `
        {
          shop {
            name
            primaryDomain {
              url
            }
          }
        }
      `
      const data = await shopifyFetch({ query })
      return {
        success: true,
        shop: data.data.shop,
      }
    }
  } catch (error) {
    console.error("Error checking Shopify connection:", error)
    return {
      success: false,
      error: error.message || "Error connecting to Shopify",
    }
  }
}

// Función para formatear IDs de Shopify
export function formatShopifyId(id, type) {
  if (!id) return null
  if (id.includes("gid://shopify/")) return id
  return `gid://shopify/${type}/${id}`
}

// Función para extraer ID numérico de un ID de Shopify
export function extractIdFromGid(gid) {
  if (!gid) return null
  if (!gid.includes("gid://shopify/")) return gid
  return gid.split("/").pop()
}

// Función para obtener la URL de la imagen
export function getImageUrl(url) {
  if (!url) return null
  return url
}

// Función para realizar solicitudes a la API de Shopify
export async function shopifyFetch({ query, variables }) {
  try {
    // Verificar variables de entorno
    const envCheck = checkShopifyEnvVars()
    if (!envCheck.isValid) {
      throw new Error(`Faltan variables de entorno para la API de Shopify: ${envCheck.missingVars.join(", ")}`)
    }

    // Construir la URL de la API de Shopify
    const apiUrl = `https://${envCheck.shopDomain}/admin/api/2023-07/graphql.json`

    // Realizar la solicitud a la API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": envCheck.accessToken,
      },
      body: JSON.stringify({
        query,
        variables: variables || {},
      }),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error en la respuesta de Shopify: ${response.status} ${response.statusText} - ${errorText}`)
    }

    // Convertir la respuesta a JSON
    const json = await response.json()
    return json
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
    throw error
  }
}

// Función para obtener información de la tienda
export async function getShopInfo() {
  try {
    const query = `
      query {
        shop {
          name
          email
          myshopifyDomain
          primaryDomain {
            url
            host
          }
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
        }
      }
    `

    const response = await shopifyFetch({ query, variables: {} })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    return response.data.shop
  } catch (error) {
    console.error("Error al obtener información de la tienda:", error)
    throw new Error(`Error al obtener información de la tienda: ${error.message}`)
  }
}
