import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function testShopifyConnection() {
  try {
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
    return {
      success: false,
      error: error,
      message: `Error de conexión: ${(error as Error).message}`,
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
