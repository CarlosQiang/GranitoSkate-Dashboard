import { ActivityLogger } from "@/lib/services/activity-logger"

const SHOPIFY_GRAPHQL_ENDPOINT = "/api/shopify"

// Consulta GraphQL para obtener colecciones
const GET_COLLECTIONS_QUERY = `
  query getCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          updatedAt
          productsCount
          image {
            url
            altText
          }
          seo {
            title
            description
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Consulta GraphQL para obtener una colección específica
const GET_COLLECTION_QUERY = `
  query getCollection($id: ID!) {
    collection(id: $id) {
      id
      title
      handle
      description
      descriptionHtml
      updatedAt
      productsCount
      image {
        url
        altText
      }
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  price
                  compareAtPrice
                }
              }
            }
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
`

// Mutación GraphQL para crear colección
const CREATE_COLLECTION_MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`

// Mutación GraphQL para actualizar colección
const UPDATE_COLLECTION_MUTATION = `
  mutation collectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`

export class CollectionsAPI {
  /**
   * Obtiene colecciones de Shopify con paginación y filtros
   */
  static async getCollections(
    params: {
      first?: number
      after?: string
      query?: string
      userId?: number
      userName?: string
    } = {},
  ) {
    const { first = 20, after, query, userId, userName } = params

    try {
      const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_COLLECTIONS_QUERY,
          variables: {
            first,
            after,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
      }

      // Registrar consulta exitosa
      if (userId && userName) {
        await ActivityLogger.log({
          usuarioId: userId,
          usuarioNombre: userName,
          accion: "GET_COLLECTIONS",
          entidad: "SHOPIFY_COLLECTION",
          descripcion: `Consultó ${data.data.collections.edges.length} colecciones`,
          metadatos: { first, after, query },
        })
      }

      return {
        collections: data.data.collections.edges.map((edge: any) => edge.node),
        pageInfo: data.data.collections.pageInfo,
        totalCount: data.data.collections.edges.length,
      }
    } catch (error) {
      if (userId) {
        await ActivityLogger.logSystemError(error as Error, "Error al obtener colecciones", userId)
      }
      throw error
    }
  }

  /**
   * Obtiene una colección específica por ID
   */
  static async getCollection(collectionId: string, userId?: number, userName?: string) {
    try {
      const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_COLLECTION_QUERY,
          variables: {
            id: collectionId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
      }

      // Registrar consulta exitosa
      if (userId && userName) {
        await ActivityLogger.log({
          usuarioId: userId,
          usuarioNombre: userName,
          accion: "GET_COLLECTION",
          entidad: "SHOPIFY_COLLECTION",
          entidadId: collectionId,
          descripcion: `Consultó colección: ${data.data.collection?.title || collectionId}`,
        })
      }

      return data.data.collection
    } catch (error) {
      if (userId) {
        await ActivityLogger.logSystemError(error as Error, `Error al obtener colección ${collectionId}`, userId)
      }
      throw error
    }
  }

  /**
   * Crea una nueva colección en Shopify
   */
  static async createCollection(collectionData: any, userId: number, userName: string) {
    try {
      const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: CREATE_COLLECTION_MUTATION,
          variables: {
            input: collectionData,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
      }

      if (data.data.collectionCreate.userErrors.length > 0) {
        throw new Error(`Validation Error: ${JSON.stringify(data.data.collectionCreate.userErrors)}`)
      }

      const collection = data.data.collectionCreate.collection

      // Registrar creación exitosa
      await ActivityLogger.log({
        usuarioId: userId,
        usuarioNombre: userName,
        accion: "CREATE_COLLECTION",
        entidad: "SHOPIFY_COLLECTION",
        entidadId: collection.id,
        descripcion: `Creó colección: ${collection.title}`,
        metadatos: { collectionData },
      })

      return collection
    } catch (error) {
      await ActivityLogger.logSystemError(error as Error, "Error al crear colección", userId)
      throw error
    }
  }

  /**
   * Actualiza una colección existente en Shopify
   */
  static async updateCollection(collectionId: string, collectionData: any, userId: number, userName: string) {
    try {
      const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: UPDATE_COLLECTION_MUTATION,
          variables: {
            input: {
              id: collectionId,
              ...collectionData,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
      }

      if (data.data.collectionUpdate.userErrors.length > 0) {
        throw new Error(`Validation Error: ${JSON.stringify(data.data.collectionUpdate.userErrors)}`)
      }

      const collection = data.data.collectionUpdate.collection

      // Registrar actualización exitosa
      await ActivityLogger.log({
        usuarioId: userId,
        usuarioNombre: userName,
        accion: "UPDATE_COLLECTION",
        entidad: "SHOPIFY_COLLECTION",
        entidadId: collection.id,
        descripcion: `Actualizó colección: ${collection.title}`,
        metadatos: { collectionData },
      })

      return collection
    } catch (error) {
      await ActivityLogger.logSystemError(error as Error, `Error al actualizar colección ${collectionId}`, userId)
      throw error
    }
  }

  /**
   * Busca colecciones por texto
   */
  static async searchCollections(searchTerm: string, userId?: number, userName?: string) {
    return this.getCollections({
      query: `title:*${searchTerm}*`,
      first: 50,
      userId,
      userName,
    })
  }
}

// Función principal para obtener colecciones (compatible con el código existente)
export async function fetchCollections() {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_COLLECTIONS_QUERY,
        variables: {
          first: 50,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
    }

    // Transformar datos para compatibilidad
    const collections = data.data.collections.edges.map((edge: any) => {
      const node = edge.node
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description,
        descriptionHtml: node.descriptionHtml,
        updatedAt: node.updatedAt,
        productsCount: node.productsCount,
        image: node.image,
        seo: node.seo,
      }
    })

    return collections
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    throw error
  }
}
