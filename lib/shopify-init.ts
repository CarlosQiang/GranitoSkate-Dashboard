import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function verificarColeccionTutoriales() {
  try {
    // Consulta para obtener la colección "Tutoriales"
    const query = gql`
      query {
        collections(first: 1, query: "title:Tutoriales") {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.collections || !data.collections.edges) {
      return {
        success: false,
        message: "No se pudo obtener la colección de tutoriales",
      }
    }

    const coleccion = data.collections.edges[0]?.node

    if (!coleccion) {
      return {
        success: false,
        message: "No se encontró la colección 'Tutoriales'",
      }
    }

    return {
      success: true,
      message: "Colección 'Tutoriales' encontrada",
      collectionId: coleccion.id,
    }
  } catch (error) {
    console.error("Error al verificar la colección de tutoriales:", error)
    return {
      success: false,
      message: `Error al verificar la colección de tutoriales: ${(error as Error).message}`,
    }
  }
}
