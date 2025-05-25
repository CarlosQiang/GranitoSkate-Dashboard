import { shopifyFetch } from "@/lib/shopify"

// Función para obtener todas las colecciones
export async function fetchCollections(limit = 50) {
  try {
    const query = `
      query {
        collections(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              handle
              image {
                url
                altText
              }
              productsCount
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    return response.data?.collections?.edges?.map((edge) => edge.node) || []
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    throw error
  }
}

// Función para obtener una colección por ID
export async function fetchCollectionById(id: string) {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Collection/${id}`

    const query = `
      query {
        collection(id: "${formattedId}") {
          id
          title
          description
          handle
          image {
            url
            altText
          }
          productsCount
          products(first: 50) {
            edges {
              node {
                id
                title
                status
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    const collection = response.data?.collection
    if (!collection) {
      throw new Error("Colección no encontrada")
    }

    // Formatear los productos
    collection.products = collection.products?.edges?.map((edge) => edge.node) || []

    return collection
  } catch (error) {
    console.error("Error al obtener colección:", error)
    throw error
  }
}

// Función para crear una colección
export async function createCollection(collectionData: any) {
  try {
    const mutation = `
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

    const variables = {
      input: {
        title: collectionData.title,
        descriptionHtml: collectionData.description || "",
        handle: collectionData.handle || "",
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (response.data?.collectionCreate?.userErrors?.length > 0) {
      throw new Error(response.data.collectionCreate.userErrors.map((e) => e.message).join(", "))
    }

    return response.data?.collectionCreate?.collection
  } catch (error) {
    console.error("Error al crear colección:", error)
    throw error
  }
}

// Función para actualizar una colección
export async function updateCollection(id: string, collectionData: any) {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Collection/${id}`

    const mutation = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: formattedId,
        title: collectionData.title,
        descriptionHtml: collectionData.description || "",
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (response.data?.collectionUpdate?.userErrors?.length > 0) {
      throw new Error(response.data.collectionUpdate.userErrors.map((e) => e.message).join(", "))
    }

    return response.data?.collectionUpdate?.collection
  } catch (error) {
    console.error("Error al actualizar colección:", error)
    throw error
  }
}

// Función para eliminar una colección
export async function deleteCollection(id: string) {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Collection/${id}`

    const mutation = `
      mutation collectionDelete($input: CollectionDeleteInput!) {
        collectionDelete(input: $input) {
          deletedCollectionId
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: formattedId,
      },
    }

    const response = await shopifyFetch({ query: mutation, variables })

    if (response.errors) {
      throw new Error(`Error de Shopify: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (response.data?.collectionDelete?.userErrors?.length > 0) {
      throw new Error(response.data.collectionDelete.userErrors.map((e) => e.message).join(", "))
    }

    return response.data?.collectionDelete?.deletedCollectionId
  } catch (error) {
    console.error("Error al eliminar colección:", error)
    throw error
  }
}
