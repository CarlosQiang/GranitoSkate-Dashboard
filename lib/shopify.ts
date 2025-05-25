// Configuración mejorada de Shopify
const shopifyConfig = {
  shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "",
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
  apiVersion: "2024-01",
}

// Función para obtener la URL base
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

// Función principal para consultas GraphQL a Shopify
export async function shopifyFetch({ query, variables = {} }: { query: string; variables?: any }) {
  try {
    // Verificar configuración
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      console.warn("Shopify no configurado correctamente")
      return {
        data: null,
        errors: [{ message: "Shopify no está configurado. Ve a /dashboard/setup para configurarlo." }],
      }
    }

    const endpoint = `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}/graphql.json`

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyConfig.accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("Errores de GraphQL:", result.errors)
    }

    return result
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
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

// Función para probar la conexión con Shopify
export async function testShopifyConnection() {
  try {
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      return {
        success: false,
        message: "Shopify no está configurado. Configura NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN y SHOPIFY_ACCESS_TOKEN",
        data: null,
      }
    }

    const query = `
      query {
        shop {
          name
          id
          url
          primaryDomain {
            url
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      return {
        success: false,
        message: `Error de Shopify: ${response.errors.map((e: any) => e.message).join(", ")}`,
        data: null,
      }
    }

    return {
      success: true,
      message: `Conexión exitosa con ${response.data?.shop?.name || "Shopify"}`,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error al conectar con Shopify: ${error instanceof Error ? error.message : "Error desconocido"}`,
      data: null,
    }
  }
}

// Función para formatear IDs de Shopify
export function formatShopifyId(id: string | number, resourceType: string): string {
  if (!id) return `gid://shopify/${resourceType}/0`

  const idStr = String(id)
  if (idStr.startsWith(`gid://shopify/${resourceType}/`)) {
    return idStr
  }

  if (idStr.startsWith("gid://shopify/")) {
    const parts = idStr.split("/")
    const numericId = parts[parts.length - 1]
    return `gid://shopify/${resourceType}/${numericId}`
  }

  return `gid://shopify/${resourceType}/${idStr}`
}

// Extraer el ID numérico de un ID de Shopify
export function extractIdFromGid(gid: string): string {
  if (!gid) return ""
  const parts = gid.split("/")
  return parts[parts.length - 1]
}

export default shopifyConfig
