import { GraphQLClient } from "graphql-request"

// Obtener las variables de entorno
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || ""
const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN || ""
const shopifyApiUrl = process.env.SHOPIFY_API_URL || `https://${shopifyDomain}/admin/api/2023-07/graphql.json`

// Crear el cliente GraphQL
const shopifyClient = new GraphQLClient(shopifyApiUrl, {
  headers: {
    "X-Shopify-Access-Token": shopifyAccessToken,
    "Content-Type": "application/json",
  },
})

async function shopifyFetch({ query, variables }) {
  try {
    const data = await shopifyClient.request(query, variables)
    return { data, error: null }
  } catch (error) {
    console.error("Error en shopifyFetch:", error)
    return { data: null, errors: [error] }
  }
}

async function testShopifyConnection(skipDataCheck = false) {
  try {
    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain) {
      return {
        success: false,
        error: new Error("Configuración de Shopify incompleta: falta el dominio de la tienda"),
        message: "Configuración de Shopify incompleta: falta el dominio de la tienda",
      }
    }

    if (!accessToken) {
      return {
        success: false,
        error: new Error("Configuración de Shopify incompleta: falta el token de acceso"),
        message: "Configuración de Shopify incompleta: falta el token de acceso",
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

    const result = await shopifyClient.request(query)
    return {
      success: true,
      data: result,
      message: "Conexión exitosa con Shopify",
    }
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)

    // Intentar extraer un mensaje de error más específico
    let errorMessage = "Error desconocido al conectar con Shopify"

    if (error instanceof Error) {
      errorMessage = error.message

      // Verificar si es un error de GraphQL con más detalles
      if ("response" in error && typeof error.response === "object" && error.response) {
        const response = error.response
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          errorMessage = response.errors.map((e) => e.message).join(", ")
        }
      }
    }

    return {
      success: false,
      error: error,
      message: errorMessage,
    }
  }
}

export { shopifyFetch, testShopifyConnection }
