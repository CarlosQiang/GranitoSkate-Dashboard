// Importación de GraphQL Request
import { gql, GraphQLClient } from "graphql-request"

// Definición de tipos
export interface Collection {
  id: string
  title: string
  description: string
  handle: string
  image?: {
    url: string
  }
  products?: {
    edges: {
      node: {
        id: string
        title: string
      }
    }[]
  }
}

// Cliente GraphQL
const getGraphQLClient = () => {
  const endpoint = process.env.SHOPIFY_API_URL || ""
  const token = process.env.SHOPIFY_ACCESS_TOKEN || ""

  const client = new GraphQLClient(endpoint, {
    headers: {
      "X-Shopify-Access-Token": token,
    },
  })

  return client
}

// Consulta para obtener colecciones
const GET_COLLECTIONS = gql`
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          image {
            url
          }
        }
      }
    }
  }
`

// Función para obtener colecciones
export async function getCollections(first = 10): Promise<Collection[]> {
  try {
    // Si estamos en un entorno de desarrollo o prueba, devolvemos datos de ejemplo
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_API_URL) {
      return Array(first)
        .fill(null)
        .map((_, i) => ({
          id: `gid://shopify/Collection/${i + 1}`,
          title: `Colección de ejemplo ${i + 1}`,
          description: "Esta es una colección de ejemplo para desarrollo",
          handle: `coleccion-ejemplo-${i + 1}`,
          image: {
            url: `https://placeholder.com/600x400?text=Colección+${i + 1}`,
          },
        }))
    }

    const client = getGraphQLClient()
    const data = await client.request(GET_COLLECTIONS, { first })

    return data.collections.edges.map((edge: any) => edge.node)
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    return []
  }
}

// Función para obtener una colección por ID
export async function getCollectionById(id: string): Promise<Collection | null> {
  try {
    // Si estamos en un entorno de desarrollo o prueba, devolvemos datos de ejemplo
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_API_URL) {
      return {
        id: id,
        title: "Colección de ejemplo",
        description: "Esta es una colección de ejemplo para desarrollo",
        handle: "coleccion-ejemplo",
        image: {
          url: "https://placeholder.com/600x400?text=Colección",
        },
        products: {
          edges: Array(5)
            .fill(null)
            .map((_, i) => ({
              node: {
                id: `gid://shopify/Product/${i + 1}`,
                title: `Producto de ejemplo ${i + 1}`,
              },
            })),
        },
      }
    }

    // Implementar la consulta real aquí
    return null
  } catch (error) {
    console.error("Error al obtener la colección:", error)
    return null
  }
}

// Función para crear una colección
export async function createCollection(collection: Partial<Collection>): Promise<Collection | null> {
  try {
    // Si estamos en un entorno de desarrollo o prueba, devolvemos datos de ejemplo
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_API_URL) {
      return {
        id: "new-id",
        title: collection.title || "Nueva colección",
        description: collection.description || "",
        handle: collection.handle || "nueva-coleccion",
        image: collection.image,
      }
    }

    // Implementar la mutación real aquí
    return null
  } catch (error) {
    console.error("Error al crear la colección:", error)
    return null
  }
}

// Añadir funciones faltantes
export async function addProductsToCollection(collectionId: string, productIds: string[]): Promise<any> {
  try {
    // Si estamos en un entorno de desarrollo o prueba, devolvemos datos de ejemplo
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_API_URL) {
      return {
        id: collectionId,
        title: "Colección actualizada",
        productsAdded: productIds.length,
      }
    }

    // Implementar la mutación real aquí
    return null
  } catch (error) {
    console.error("Error al añadir productos a la colección:", error)
    return null
  }
}

export async function removeProductsFromCollection(collectionId: string, productIds: string[]): Promise<any> {
  try {
    // Si estamos en un entorno de desarrollo o prueba, devolvemos datos de ejemplo
    if (process.env.NODE_ENV === "development" || !process.env.SHOPIFY_API_URL) {
      return {
        id: collectionId,
        title: "Colección actualizada",
        productsRemoved: productIds.length,
      }
    }

    // Implementar la mutación real aquí
    return null
  } catch (error) {
    console.error("Error al eliminar productos de la colección:", error)
    return null
  }
}
