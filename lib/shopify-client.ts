import { getShopifyConfig, getShopifyHeaders } from "@/lib/config/shopify"

// Clase para manejar errores de la API de Shopify
export class ShopifyApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "ShopifyApiError"
    this.statusCode = statusCode
  }
}

// Cliente para realizar solicitudes a la API de Shopify
export async function shopifyFetch<T>(query: string, variables = {}): Promise<T> {
  const config = getShopifyConfig()

  if (!config.apiUrl) {
    throw new Error("URL de la API de Shopify no configurada")
  }

  if (!config.accessToken) {
    throw new Error("Token de acceso de Shopify no configurado")
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: getShopifyHeaders(),
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const result = await response.json()

    // Verificar si hay errores en la respuesta
    if (result.errors) {
      console.error("Errores en la respuesta de Shopify:", JSON.stringify(result.errors, null, 2))

      // Extraer el primer mensaje de error
      const errorMessage = result.errors[0]?.message || "Error desconocido en la API de Shopify"
      throw new ShopifyApiError(errorMessage, response.status)
    }

    if (!response.ok) {
      throw new ShopifyApiError(`Error HTTP: ${response.status}`, response.status)
    }

    return result.data as T
  } catch (error) {
    // Si ya es un ShopifyApiError, lo propagamos
    if (error instanceof ShopifyApiError) {
      throw error
    }

    // De lo contrario, creamos un nuevo error
    console.error("Error al realizar solicitud a Shopify:", error)
    throw new Error(error instanceof Error ? error.message : "Error desconocido al conectar con Shopify")
  }
}

// Función para verificar la conexión con Shopify
export async function checkShopifyConnection() {
  const query = `
    query {
      shop {
        name
        email
        myshopifyDomain
        plan {
          displayName
        }
      }
    }
  `

  try {
    const data = await shopifyFetch<{ shop: any }>(query)
    return {
      success: true,
      shop: data.shop,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
