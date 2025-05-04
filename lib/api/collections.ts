import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las colecciones
export async function fetchCollections(limit = 20) {
  console.log(`Fetching ${limit} collections from Shopify...`)

  const query = gql`
    query GetCollections($limit: Int!) {
      collections(first: $limit) {
        edges {
          node {
            id
            title
            handle
            productsCount
            image {
              url
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.collections || !data.collections.edges) {
      console.error("Respuesta de colecciones incompleta:", data)
      return []
    }

    const collections = data.collections.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      title: edge.node.title,
      handle: edge.node.handle,
      productsCount: edge.node.productsCount || 0,
      image: edge.node.image,
    }))

    console.log(`Successfully fetched ${collections.length} collections`)
    return collections
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw new Error(`Error al cargar colecciones: ${(error as Error).message}`)
  }
}

// Función para obtener una colección por ID
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
        image {
          url
          altText
        }
        productsCount
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
        metafields(first: 20) {
          edges {
            node {
              id
              namespace
              key
              value
              type
            }
          }
        }
      }
    }
  `

  try {
    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.collection) {
      console.error(`Colección no encontrada: ${id}`)
      throw new Error(`Colección no encontrada: ${id}`)
    }

    console.log(
      `Successfully fetched collection: ${data.collection.title} with ${data.collection.productsCount} products`,
    )
    return data.collection
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${(error as Error).message}`)
  }
}

// Función para crear una colección
export async function createCollection(collectionData: any) {
  console.log("Creating collection with data:", JSON.stringify(collectionData, null, 2))

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
      handle: collectionData.handle || undefined,
    }

    // Si hay metafields, añadirlos
    if (collectionData.metafields && collectionData.metafields.length > 0) {
      input.metafields = collectionData.metafields
    }

    const data = await shopifyClient.request(mutation, { input })

    if (data.collectionCreate.userErrors && data.collectionCreate.userErrors.length > 0) {
      console.error("Errores al crear colección:", data.collectionCreate.userErrors)
      throw new Error(`Error al crear colección: ${data.collectionCreate.userErrors[0].message}`)
    }

    console.log(`Successfully created collection: ${data.collectionCreate.collection.title}`)
    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw error
  }
}

// Función para actualizar una colección
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

    console.log("Updating collection with data:", JSON.stringify(input, null, 2))

    const data = await shopifyClient.request(mutation, { input })

    if (data.collectionUpdate.userErrors && data.collectionUpdate.userErrors.length > 0) {
      console.error("Errores al actualizar colección:", data.collectionUpdate.userErrors)
      throw new Error(`Error al actualizar colección: ${data.collectionUpdate.userErrors[0].message}`)
    }

    console.log(`Successfully updated collection: ${data.collectionUpdate.collection.title}`)
    return data.collectionUpdate.collection
  } catch (error) {
    console.error(`Error updating collection ${id}:`, error)
    throw error
  }
}

// Función para eliminar una colección
export async function deleteCollection(id: string) {
  // Asegurarse de que el ID tenga el formato correcto
  const isFullShopifyId = id.includes("gid://shopify/Collection/")
  const formattedId = isFullShopifyId ? id : `gid://shopify/Collection/${id}`

  console.log(`Deleting collection with ID: ${formattedId}`)

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
      console.error("Errores al eliminar colección:", data.collectionDelete.userErrors)
      throw new Error(`Error al eliminar colección: ${data.collectionDelete.userErrors[0].message}`)
    }

    console.log(`Successfully deleted collection with ID: ${formattedId}`)
    return data.collectionDelete.deletedCollectionId
  } catch (error) {
    console.error(`Error deleting collection ${id}:`, error)
    throw error
  }
}
