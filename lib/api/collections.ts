import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las colecciones
export async function fetchCollections() {
  try {
    const query = gql`
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              productsCount
              image {
                url
                altText
              }
              products(first: 5) {
                edges {
                  node {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.collections.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw new Error(`Error al obtener colecciones: ${error.message}`)
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
          productsCount
          image {
            url
            altText
          }
          products(first: 10) {
            edges {
              node {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id })
    return data.collection
  } catch (error) {
    console.error(`Error fetching collection with ID ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${error.message}`)
  }
}

// Función para obtener los productos de una colección
export async function fetchCollectionProducts(collectionId) {
  try {
    const query = gql`
      query GetCollectionProducts($collectionId: ID!) {
        collection(id: $collectionId) {
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { collectionId })
    return data.collection.products
  } catch (error) {
    console.error(`Error fetching products for collection ${collectionId}:`, error)
    throw new Error(`Error al cargar los productos de la colección: ${error.message}`)
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
        descriptionHtml: collectionData.description,
        image: collectionData.image ? { src: collectionData.image } : null,
        seo: {
          title: collectionData.seoTitle || collectionData.title,
          description: collectionData.seoDescription || collectionData.description,
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw new Error(`Error al crear la colección: ${error.message}`)
  }
}

// Función para actualizar una colección existente
export async function updateCollection(id, collectionData) {
  try {
    const mutation = gql`
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

    const variables = {
      input: {
        id,
        title: collectionData.title,
        descriptionHtml: collectionData.description,
        image: collectionData.image ? { src: collectionData.image } : null,
        seo: {
          title: collectionData.seoTitle || collectionData.title,
          description: collectionData.seoDescription || collectionData.description,
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
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

// Función para añadir productos a una colección
export async function addProductsToCollection(collectionId, productIds) {
  try {
    // Verificar que los IDs de productos estén en el formato correcto
    const formattedProductIds = productIds.map((id) => {
      // Si el ID ya está en formato gid://shopify/Product/123, usarlo directamente
      if (typeof id === "string" && id.startsWith("gid://shopify/Product/")) {
        return id
      }
      // Si es un ID numérico o una cadena sin el prefijo, añadir el prefijo
      return `gid://shopify/Product/${id.toString().replace(/\D/g, "")}`
    })

    console.log("Añadiendo productos a colección:", {
      collectionId,
      productIds: formattedProductIds,
    })

    const mutation = gql`
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(collectionId: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: collectionId,
      productIds: formattedProductIds,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(data.collectionAddProducts.userErrors[0].message)
    }

    return data.collectionAddProducts.collection
  } catch (error) {
    console.error(`Error adding products to collection ${collectionId}:`, error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

// Función para eliminar productos de una colección
export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    // Verificar que los IDs de productos estén en el formato correcto
    const formattedProductIds = productIds.map((id) => {
      // Si el ID ya está en formato gid://shopify/Product/123, usarlo directamente
      if (typeof id === "string" && id.startsWith("gid://shopify/Product/")) {
        return id
      }
      // Si es un ID numérico o una cadena sin el prefijo, añadir el prefijo
      return `gid://shopify/Product/${id.toString().replace(/\D/g, "")}`
    })

    console.log("Eliminando productos de colección:", {
      collectionId,
      productIds: formattedProductIds,
    })

    const mutation = gql`
      mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(collectionId: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      id: collectionId,
      productIds: formattedProductIds,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(data.collectionRemoveProducts.userErrors[0].message)
    }

    return data.collectionRemoveProducts.collection
  } catch (error) {
    console.error(`Error removing products from collection ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}
