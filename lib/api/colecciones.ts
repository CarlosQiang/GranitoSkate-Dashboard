"use server"

import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

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

// Función para añadir productos a una colección
export async function addProductsToCollection(collectionId, productIds) {
  try {
    const mutation = gql`
      mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection {
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
      id: collectionId,
      productIds: productIds,
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
    const mutation = gql`
      mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
          collection {
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
      id: collectionId,
      productIds: productIds,
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
