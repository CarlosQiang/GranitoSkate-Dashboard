import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCollections(limit = 20) {
  const query = gql`
    query {
      collections(first: ${limit}) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `

  try {
    console.log("Fetching collections from Shopify...")
    const data = await shopifyClient.request(query)
    console.log("Collections response received")

    if (!data || !data.collections || !data.collections.edges) {
      console.error("Respuesta de colecciones incompleta:", data)
      return []
    }

    return data.collections.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      title: edge.node.title,
      handle: edge.node.handle,
    }))
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw new Error(`Error al cargar las colecciones: ${(error as Error).message}`)
  }
}

export async function fetchCollectionById(id: string) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = id.includes("gid://shopify/Collection/")
  const formattedId = isFullShopifyId ? id : `gid://shopify/Collection/${id}`

  console.log(`Fetching collection with ID: ${formattedId}`)

  const query = gql`
    query GetCollectionById($id: ID!) {
      collection(id: $id) {
        id
        title
        handle
        description
        descriptionHtml
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
              }
              status
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.collection) {
      throw new Error(`Colección no encontrada: ${id}`)
    }

    return data.collection
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${(error as Error).message}`)
  }
}

// Actualizar la función createCollection para usar la nueva API
export async function createCollection(collectionData: any) {
  const mutation = gql`
    mutation CollectionCreate($input: CollectionInput!) {
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

  try {
    // Preparar los datos para la creación
    const input = {
      title: collectionData.title,
      descriptionHtml: collectionData.descriptionHtml || "",
      handle: collectionData.handle || undefined, // Usar el handle generado si se proporciona
    }

    // Si hay metafields, añadirlos
    if (collectionData.metafields && collectionData.metafields.length > 0) {
      input.metafields = collectionData.metafields
    }

    console.log("Enviando datos para crear colección:", JSON.stringify(input, null, 2))

    const data = await shopifyClient.request(mutation, { input })

    if (data.collectionCreate.userErrors && data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw error
  }
}

// Actualizar la función updateCollection para usar la nueva API
export async function updateCollection(id: string, collectionData: any) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = id.includes("gid://shopify/Collection/")
  const formattedId = isFullShopifyId ? id : `gid://shopify/Collection/${id}`

  console.log(`Updating collection with ID: ${formattedId}`)

  const mutation = gql`
    mutation CollectionUpdate($input: CollectionInput!) {
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

  try {
    // Preparar los datos para la actualización
    const input = {
      id: formattedId,
      title: collectionData.title,
      descriptionHtml: collectionData.descriptionHtml || "",
    }

    // Si hay metafields, añadirlos
    if (collectionData.metafields && collectionData.metafields.length > 0) {
      input.metafields = collectionData.metafields
    }

    console.log("Enviando datos para actualizar colección:", JSON.stringify(input, null, 2))

    const data = await shopifyClient.request(mutation, { input })

    if (data.collectionUpdate.userErrors && data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
  } catch (error) {
    console.error(`Error updating collection ${id}:`, error)
    throw error
  }
}

export async function deleteCollection(id: string) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = id.includes("gid://shopify/Collection/")
  const formattedId = isFullShopifyId ? id : `gid://shopify/Collection/${id}`

  const mutation = gql`
    mutation CollectionDelete($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(mutation, {
      input: {
        id: formattedId,
      },
    })

    if (data.collectionDelete.userErrors && data.collectionDelete.userErrors.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return data.collectionDelete.deletedCollectionId
  } catch (error) {
    console.error(`Error deleting collection ${id}:`, error)
    throw error
  }
}
