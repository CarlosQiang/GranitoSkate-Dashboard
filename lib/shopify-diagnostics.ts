import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function testShopifyConnection() {
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
    const query = gql`
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
        const response = error.response as any
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          errorMessage = response.errors.map((e: any) => e.message).join(", ")
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

export async function testCollectionsQuery() {
  try {
    // Consulta simple para verificar que podemos obtener colecciones
    const query = gql`
      {
        collections(first: 5) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `

    const result = await shopifyClient.request(query)
    return {
      success: true,
      data: result,
      message: "Consulta de colecciones exitosa",
    }
  } catch (error) {
    console.error("Error al probar la consulta de colecciones:", error)
    return {
      success: false,
      error: error,
      message: `Error en la consulta: ${(error as Error).message}`,
    }
  }
}
