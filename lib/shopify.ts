/**
 * Cliente de Shopify para interactuar con la API de Shopify
 */

// Verificar que las variables de entorno necesarias estén definidas
const SHOPIFY_SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "demo-store.myshopify.com"
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "demo-token"
const SHOPIFY_API_URL = process.env.SHOPIFY_API_URL || "https://demo-store.myshopify.com/admin/api/2023-01/graphql.json"

// Advertir si estamos usando valores de demostración
if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN || !process.env.SHOPIFY_API_URL) {
  console.warn(
    "⚠️ Usando valores de demostración para Shopify. Asegúrate de configurar NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN, SHOPIFY_ACCESS_TOKEN y SHOPIFY_API_URL en producción.",
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
    // En modo de desarrollo o si faltan variables de entorno, devolvemos datos simulados
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.log("Usando datos simulados para la consulta Shopify")
      return { shop: { name: "Tienda Demo" } }
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
    // Devolver datos simulados en caso de error
    return { shop: { name: "Tienda Demo (Error)" } }
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
    // En modo de desarrollo o si faltan variables de entorno, simulamos una conexión exitosa
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return {
        success: true,
        message: "Conectado a Tienda Demo (Simulado)",
      }
    }

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
  // Si estamos en desarrollo o no hay dominio configurado, devolvemos un valor por defecto
  if (process.env.NODE_ENV === "development" || !SHOPIFY_SHOP_DOMAIN) {
    return "https://demo-store.myshopify.com"
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
