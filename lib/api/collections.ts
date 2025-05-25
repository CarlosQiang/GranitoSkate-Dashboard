import { shopifyFetch } from "@/lib/shopify"

export interface Collection {
  id: string
  title: string
  description: string
  handle: string
  image?: {
    url: string
    altText: string
  }
  products: Array<{
    id: string
    title: string
  }>
}

export async function fetchCollections(limit = 10): Promise<Collection[]> {
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
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      throw new Error(response.errors.map((e: any) => e.message).join(", "))
    }

    return (
      response.data?.collections?.edges?.map((edge: any) => ({
        ...edge.node,
        products: edge.node.products?.edges?.map((prodEdge: any) => prodEdge.node) || [],
      })) || []
    )
  } catch (error) {
    console.error("Error fetching collections:", error)
    return []
  }
}

export async function fetchCollectionById(id: string): Promise<Collection | null> {
  try {
    const query = `
      query {
        collection(id: "gid://shopify/Collection/${id}") {
          id
          title
          description
          handle
          image {
            url
            altText
          }
          products(first: 50) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors || !response.data?.collection) {
      return null
    }

    const collection = response.data.collection
    return {
      ...collection,
      products: collection.products?.edges?.map((edge: any) => edge.node) || [],
    }
  } catch (error) {
    console.error("Error fetching collection by ID:", error)
    return null
  }
}

export async function createCollection(collectionData: any): Promise<Collection | null> {
  try {
    const mutation = `
      mutation collectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
            description
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: mutation,
      variables: {
        input: collectionData,
      },
    })

    if (response.errors || response.data?.collectionCreate?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.collectionCreate?.userErrors?.[0]?.message)
    }

    return response.data?.collectionCreate?.collection || null
  } catch (error) {
    console.error("Error creating collection:", error)
    throw error
  }
}

export async function updateCollection(id: string, collectionData: any): Promise<Collection | null> {
  try {
    const mutation = `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            title
            description
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: mutation,
      variables: {
        input: {
          id: `gid://shopify/Collection/${id}`,
          ...collectionData,
        },
      },
    })

    if (response.errors || response.data?.collectionUpdate?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.collectionUpdate?.userErrors?.[0]?.message)
    }

    return response.data?.collectionUpdate?.collection || null
  } catch (error) {
    console.error("Error updating collection:", error)
    throw error
  }
}

export async function deleteCollection(id: string): Promise<boolean> {
  try {
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

    const response = await shopifyFetch({
      query: mutation,
      variables: {
        input: {
          id: `gid://shopify/Collection/${id}`,
        },
      },
    })

    if (response.errors || response.data?.collectionDelete?.userErrors?.length > 0) {
      throw new Error(response.errors?.[0]?.message || response.data?.collectionDelete?.userErrors?.[0]?.message)
    }

    return !!response.data?.collectionDelete?.deletedCollectionId
  } catch (error) {
    console.error("Error deleting collection:", error)
    throw error
  }
}
