/**
 * Cliente de Shopify para interactuar con la API de Shopify
 */

// Verificar que las variables de entorno necesarias estén definidas
const SHOPIFY_SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN
const SHOPIFY_API_URL = process.env.SHOPIFY_API_URL

if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ACCESS_TOKEN || !SHOPIFY_API_URL) {
  console.warn(
    "⚠️ Faltan variables de entorno de Shopify. Asegúrate de configurar NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN, SHOPIFY_ACCESS_TOKEN y SHOPIFY_API_URL.",
  )
}

/**
 * Función para realizar consultas GraphQL a la API de Shopify
 */
export async function shopifyFetch({
  query,
  variables = {},
}: {
  query: string
  variables?: Record<string, any>
}): Promise<any> {
  try {
    if (!SHOPIFY_API_URL || !SHOPIFY_ACCESS_TOKEN) {
      throw new Error("Faltan variables de entorno de Shopify")
    }

    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
    })

    const result = await response.json()

    if (result.errors) {
      console.error("Error en la consulta GraphQL:", result.errors)
      throw new Error(`Error en la consulta GraphQL: ${result.errors[0].message}`)
    }

    return result.data
  } catch (error) {
    console.error("Error al realizar la consulta a Shopify:", error)
    throw error
  }
}

/**
 * Función para verificar la conexión con Shopify
 */
export async function checkShopifyConnection(): Promise<{
  success: boolean
  message?: string
}> {
  try {
    // Consulta simple para verificar la conexión
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

    if (data && data.shop) {
      return {
        success: true,
        message: `Conectado a ${data.shop.name}`,
      }
    }

    return {
      success: false,
      message: "No se pudo obtener información de la tienda",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

/**
 * Función para obtener la URL de la tienda Shopify
 */
export function getShopifyStoreUrl(): string {
  if (!SHOPIFY_SHOP_DOMAIN) {
    return "#"
  }

  // Asegurarse de que el dominio tenga el formato correcto
  if (SHOPIFY_SHOP_DOMAIN.includes("myshopify.com")) {
    return `https://${SHOPIFY_SHOP_DOMAIN}`
  }

  return `https://${SHOPIFY_SHOP_DOMAIN}.myshopify.com`
}

/**
 * Función para formatear el precio de Shopify
 */
export function formatShopifyPrice(amount: string | number): string {
  const price = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(price)
}
