import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import { formatShopifyId } from "@/lib/shopify"

export async function fetchCollections(limit = 20) {
  try {
    const query = gql`
      query GetCollections($first: Int!) {
        collections(first: $first) {
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

    const variables = {
      first: limit,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.collections?.edges) {
      throw new Error("No se pudieron obtener las colecciones")
    }

    return data.collections.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw new Error(`Error al cargar colecciones: ${(error as Error).message}`)
  }
}

export async function fetchCollectionById(id) {
  try {
    const formattedId = formatShopifyId(id, "Collection")

    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          description
          productsCount
          image {
            url
          }
        }
      }
    `

    const variables = {
      id: formattedId,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.collection) {
      throw new Error("No se pudo obtener la colección")
    }

    return data.collection
  } catch (error) {
    console.error("Error fetching collection by ID:", error)
    throw new Error(`Error al cargar la colección: ${(error as Error).message}`)
  }
}

export async function fetchCollectionProducts(id, limit = 20) {
  try {
    const formattedId = formatShopifyId(id, "Collection")

    const query = gql`
      query GetCollectionProducts($id: ID!, $first: Int!) {
        collection(id: $id) {
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                status
                totalInventory
                featuredImage {
                  url
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      id: formattedId,
      first: limit,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.collection?.products?.edges) {
      throw new Error("No se pudieron obtener los productos de la colección")
    }

    return data.collection.products.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching collection products:", error)
    throw new Error(`Error al cargar los productos de la colección: ${(error as Error).message}`)
  }
}

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
      input: collectionData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.collectionCreate?.userErrors?.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw new Error(`Error al crear la colección: ${(error as Error).message}`)
  }
}

export async function updateCollection(id, collectionData) {
  try {
    const formattedId = formatShopifyId(id, "Collection")

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
        id: formattedId,
        ...collectionData,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.collectionUpdate?.userErrors?.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
  } catch (error) {
    console.error("Error updating collection:", error)
    throw new Error(`Error al actualizar la colección: ${(error as Error).message}`)
  }
}

export async function deleteCollection(id) {
  try {
    const formattedId = formatShopifyId(id, "Collection")

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
        id: formattedId,
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.collectionDelete?.userErrors?.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return { success: true, id: data.collectionDelete.deletedCollectionId }
  } catch (error) {
    console.error("Error deleting collection:", error)
    throw new Error(`Error al eliminar la colección: ${(error as Error).message}`)
  }
}
