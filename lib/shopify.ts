import { GraphQLClient } from "graphql-request"

// Determinar si estamos en el cliente o en el servidor
const isClient = typeof window !== "undefined"

// Configuración del cliente GraphQL para Shopify
const shopifyClient = new GraphQLClient(
  isClient
    ? "/api/shopify/proxy" // Usar el proxy en el cliente
    : `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`, // Usar la API directamente en el servidor
  {
    headers: isClient
      ? {
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
        },
    timeout: 30000, // 30 segundos
  },
)

// Exportar como default para mantener compatibilidad con el código existente
export default shopifyClient

// Función para verificar la conexión con Shopify
export async function checkShopifyConnection() {
  try {
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
      const data = await shopifyClient.request(query)
      return {
        success: true,
        shop: data.shop,
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
    // Obtener las variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    // Verificar que las variables de entorno estén definidas
    if (!shopDomain || !accessToken) {
      throw new Error("Faltan variables de entorno para la API de Shopify")
    }

    // Construir la URL de la API de Shopify
    const apiUrl = `https://${shopDomain}/admin/api/2023-07/graphql.json`

    // Realizar la solicitud a la API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
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
