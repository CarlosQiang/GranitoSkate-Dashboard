import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las colecciones
export async function fetchCollections(limit = 50, cursor = null) {
  try {
    const query = gql`
      query GetCollections($limit: Int!, $cursor: String) {
        collections(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              updatedAt
              productsCount {
                count
              }
              image {
                id
                url
                altText
              }
            }
          }
        }
      }
    `

    const variables = {
      limit,
      cursor,
    }

    const data = await shopifyClient.request(query, variables)

    // Transformar los datos para mantener compatibilidad con el código existente
    const collections = data.collections.edges.map((edge) => ({
      ...edge.node,
      productsCount: edge.node.productsCount.count,
    }))

    return {
      pageInfo: data.collections.pageInfo,
      edges: collections.map((collection) => ({ node: collection })),
    }
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw new Error(`Error al cargar colecciones: ${error.message}`)
  }
}

// Función para obtener una colección por ID
export async function fetchCollectionById(id) {
  try {
    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          description
          descriptionHtml
          updatedAt
          productsCount {
            count
          }
          image {
            id
            url
            altText
          }
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)

    // Transformar los datos para mantener compatibilidad con el código existente
    const collection = {
      ...data.collection,
      productsCount: data.collection.productsCount.count,
    }

    return collection
  } catch (error) {
    console.error(`Error fetching collection with ID ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${error.message}`)
  }
}

// Función para crear una nueva colección
export async function createCollection(collectionData) {
  try {
    const mutation = gql`
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
            productsCount {
              count
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: collectionData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    // Transformar los datos para mantener compatibilidad con el código existente
    const collection = {
      ...data.collectionCreate.collection,
      productsCount: data.collectionCreate.collection.productsCount?.count || 0,
    }

    return collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw new Error(`Error al crear la colección: ${error.message}`)
  }
}

// Función para actualizar una colección existente
export async function updateCollection(id, collectionData) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    // Preparar los datos de la colección, asegurándose de que los campos sean válidos
    const input = {
      id: formattedId,
      title: collectionData.title,
    }

    // Solo incluir la descripción si está definida y no es null
    if (collectionData.description !== undefined && collectionData.description !== null) {
      input.descriptionHtml = collectionData.description
    }

    // Incluir metafields si están definidos
    if (collectionData.metafields && Array.isArray(collectionData.metafields)) {
      input.metafields = collectionData.metafields
    }

    console.log("Datos de actualización de colección:", input)

    const mutation = gql`
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            title
            description
            descriptionHtml
            productsCount {
              count
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionUpdate.userErrors && data.collectionUpdate.userErrors.length > 0) {
      console.error("Errores al actualizar colección:", data.collectionUpdate.userErrors)
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    // Transformar los datos para mantener compatibilidad con el código existente
    const collection = {
      ...data.collectionUpdate.collection,
      productsCount: data.collectionUpdate.collection.productsCount?.count || 0,
    }

    return collection
  } catch (error) {
    console.error(`Error updating collection with ID ${id}:`, error)
    throw new Error(`Error al actualizar la colección: ${error.message}`)
  }
}

// Función para eliminar una colección
export async function deleteCollection(id) {
  try {
    const mutation = gql`
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
        id,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionDelete.userErrors.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return data.collectionDelete.deletedCollectionId
  } catch (error) {
    console.error(`Error deleting collection with ID ${id}:`, error)
    throw new Error(`Error al eliminar la colección: ${error.message}`)
  }
}

// Función para obtener los productos de una colección
export async function fetchCollectionProducts(collectionId, limit = 50, cursor = null) {
  try {
    const query = gql`
      query GetCollectionProducts($collectionId: ID!, $limit: Int!, $cursor: String) {
        collection(id: $collectionId) {
          products(first: $limit, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price
                      compareAtPrice
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      collectionId,
      limit,
      cursor,
    }

    const data = await shopifyClient.request(query, variables)
    return data.collection.products
  } catch (error) {
    console.error(`Error fetching products for collection with ID ${collectionId}:`, error)
    throw new Error(`Error al cargar los productos de la colección: ${error.message}`)
  }
}

// Función para añadir productos a una colección
export async function addProductsToCollection(collectionId, productIds) {
  try {
    // Asegurarse de que los IDs tengan el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    // Asegurarse de que los IDs de productos tengan el formato correcto
    const formattedProductIds = productIds
      .map((id) => {
        if (typeof id !== "string") {
          console.warn("ID de producto no es una cadena:", id)
          return null
        }
        return id.includes("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`
      })
      .filter(Boolean) // Eliminar cualquier ID nulo

    if (formattedProductIds.length === 0) {
      throw new Error("No se proporcionaron IDs de productos válidos")
    }

    console.log("Añadiendo productos a colección:", {
      collectionId: formattedCollectionId,
      productIds: formattedProductIds,
    })

    const mutation = gql`
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount {
              count
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      console.error("Errores al añadir productos:", data.collectionAddProducts.userErrors)
      throw new Error(data.collectionAddProducts.userErrors[0].message)
    }

    // Transformar los datos para mantener compatibilidad con el código existente
    const collection = {
      ...data.collectionAddProducts.collection,
      productsCount: data.collectionAddProducts.collection.productsCount?.count || 0,
    }

    return collection
  } catch (error) {
    console.error(`Error adding products to collection with ID ${collectionId}:`, error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

// Función para eliminar productos de una colección
export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    // Asegurarse de que los IDs tengan el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    // Asegurarse de que los IDs de productos tengan el formato correcto
    const formattedProductIds = productIds
      .map((id) => {
        if (typeof id !== "string") {
          console.warn("ID de producto no es una cadena:", id)
          return null
        }
        return id.includes("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`
      })
      .filter(Boolean) // Eliminar cualquier ID nulo

    if (formattedProductIds.length === 0) {
      throw new Error("No se proporcionaron IDs de productos válidos")
    }

    console.log("Eliminando productos de colección:", {
      collectionId: formattedCollectionId,
      productIds: formattedProductIds,
    })

    // Usar la API GraphQL directamente en lugar de pasar por el endpoint REST
    const mutation = gql`
      mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
          job {
            id
            done
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    }

    console.log("Enviando mutación GraphQL:", JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)
    console.log("Respuesta de Shopify:", JSON.stringify(data, null, 2))

    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      console.error("Errores al eliminar productos:", data.collectionRemoveProducts.userErrors)
      throw new Error(data.collectionRemoveProducts.userErrors[0].message)
    }

    // Esperar un momento para que Shopify procese la eliminación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Obtener la colección actualizada para devolver
    const updatedCollection = await fetchCollectionById(formattedCollectionId)

    return updatedCollection
  } catch (error) {
    console.error(`Error removing products from collection with ID ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}
