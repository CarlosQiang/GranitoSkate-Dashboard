"use server"

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

    // Transformar los datos para mantener compatibilidad con el código existente
    return data.collections.edges.map((edge) => ({
      ...edge.node,
      productsCount: edge.node.productsCount || 0,
    }))
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw new Error(`Error al obtener colecciones: ${error.message}`)
  }
}

// Función para obtener una colección por ID
export async function fetchCollectionById(id) {
  try {
    // Ensure the ID has the correct format
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

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

    const data = await shopifyClient.request(query, { id: formattedId })

    // Transform the data to maintain compatibility with existing code
    return {
      ...data.collection,
      productsCount: data.collection.productsCount || 0,
    }
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
    // Aseguramos que el ID de la colección tenga el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    // Formateamos los IDs de los productos correctamente
    const formattedProductIds = productIds.map((id) => {
      if (typeof id === "string" && id.includes("gid://shopify/Product/")) {
        return id
      }
      return `gid://shopify/Product/${id.toString().replace(/\D/g, "")}`
    })

    console.log("Añadiendo productos a colección:", {
      collectionId: formattedCollectionId,
      productIds: formattedProductIds,
    })

    // Corregimos la mutación para usar el argumento id en lugar de collectionId
    const mutation = gql`
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
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
      id: formattedCollectionId,
      productIds: formattedProductIds,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(data.collectionAddProducts.userErrors[0].message)
    }

    // Transformamos los datos para mantener compatibilidad con el código existente
    return {
      ...data.collectionAddProducts.collection,
      productsCount: data.collectionAddProducts.collection.productsCount || 0,
    }
  } catch (error) {
    console.error(`Error adding products to collection ${collectionId}:`, error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

// Función para eliminar productos de una colección
export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    // Aseguramos que el ID de la colección tenga el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    // Formateamos los IDs de los productos correctamente
    const formattedProductIds = productIds.map((id) => {
      if (typeof id === "string" && id.includes("gid://shopify/Product/")) {
        return id
      }
      return `gid://shopify/Product/${id.toString().replace(/\D/g, "")}`
    })

    console.log("Eliminando productos de colección:", {
      collectionId: formattedCollectionId,
      productIds: formattedProductIds,
    })

    // Corregimos la mutación para usar el argumento id en lugar de collectionId
    // y corregimos la estructura de la respuesta
    const mutation = gql`
      mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
          job {
            id
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

    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(data.collectionRemoveProducts.userErrors[0].message)
    }

    // Devolvemos el ID de la colección para mantener compatibilidad
    return {
      id: formattedCollectionId,
    }
  } catch (error) {
    console.error(`Error removing products from collection ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}

// Función para obtener productos que no están en una colección
export async function fetchProductsNotInCollection(collectionId) {
  try {
    // Primero obtenemos todos los productos
    const allProductsQuery = gql`
      query {
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
            }
          }
        }
      }
    `

    // Luego obtenemos los productos de la colección
    const collectionProductsQuery = gql`
      query GetCollectionProducts($collectionId: ID!) {
        collection(id: $collectionId) {
          products(first: 50) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `

    const [allProductsData, collectionProductsData] = await Promise.all([
      shopifyClient.request(allProductsQuery),
      shopifyClient.request(collectionProductsQuery, {
        collectionId: collectionId.includes("gid://shopify/Collection/")
          ? collectionId
          : `gid://shopify/Collection/${collectionId}`,
      }),
    ])

    // Extraemos los IDs de los productos en la colección
    const collectionProductIds = collectionProductsData.collection.products.edges.map((edge) => edge.node.id)

    // Filtramos los productos que no están en la colección
    const productsNotInCollection = allProductsData.products.edges.filter(
      (edge) => !collectionProductIds.includes(edge.node.id),
    )

    return {
      edges: productsNotInCollection,
    }
  } catch (error) {
    console.error(`Error fetching products not in collection ${collectionId}:`, error)
    throw new Error(`Error al cargar productos no incluidos en la colección: ${error.message}`)
  }
}

// Alias para mantener compatibilidad
export const addProductToCollection = addProductsToCollection
export const removeProductFromCollection = removeProductsFromCollection
