import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCollections(limit = 20) {
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

    return data.collections.edges.map((edge: any) => ({
      id: edge.node.id.split("/").pop(),
      title: edge.node.title,
      handle: edge.node.handle,
      productsCount: edge.node.productsCount,
      image: edge.node.image,
    }))
  } catch (error) {
    console.error("Error fetching collections:", error)
    return []
  }
}

export async function fetchCollectionById(id: string) {
  const query = gql`
    query GetCollectionById($id: ID!) {
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
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
              }
              status
              totalInventory
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
    const data = await shopifyClient.request(query, { id: `gid://shopify/Collection/${id}` })
    return data.collection
  } catch (error) {
    console.error(`Error fetching collection ${id}:`, error)
    throw new Error(`Failed to fetch collection ${id}`)
  }
}

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
    const data = await shopifyClient.request(mutation, { input: collectionData })

    if (data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error creating collection:", error)
    throw error
  }
}

export async function updateCollection(id: string, collectionData: any) {
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
    const data = await shopifyClient.request(mutation, {
      input: {
        id: `gid://shopify/Collection/${id}`,
        ...collectionData,
      },
    })

    if (data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
  } catch (error) {
    console.error(`Error updating collection ${id}:`, error)
    throw error
  }
}

export async function deleteCollection(id: string) {
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
        id: `gid://shopify/Collection/${id}`,
      },
    })

    if (data.collectionDelete.userErrors.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return data.collectionDelete.deletedCollectionId
  } catch (error) {
    console.error(`Error deleting collection ${id}:`, error)
    throw error
  }
}
