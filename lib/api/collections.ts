import { shopifyFetch } from "@/lib/shopify"

export interface Collection {
  id: string
  title: string
  description: string
  descriptionHtml: string
  handle: string
  image?: {
    id: string
    url: string
    altText: string
  }
  products: Array<{
    id: string
    title: string
    featuredImage?: {
      url: string
    }
  }>
  productsCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export async function fetchCollections(limit = 50): Promise<Collection[]> {
  try {
    const query = `
      query {
        collections(first: ${limit}, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              handle
              createdAt
              updatedAt
              publishedAt
              image {
                id
                url
                altText
              }
              productsCount
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    featuredImage {
                      url
                    }
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
      console.error("Error fetching collections:", response.errors)
      return []
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
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Collection/${id}`

    const query = `
      query {
        collection(id: "${formattedId}") {
          id
          title
          description
          descriptionHtml
          handle
          createdAt
          updatedAt
          publishedAt
          image {
            id
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
                }
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

    const input = {
      title: collectionData.title,
      descriptionHtml: collectionData.description || collectionData.descriptionHtml,
      handle: collectionData.handle,
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.collectionCreate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.collectionCreate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return response.data?.collectionCreate?.collection || null
  } catch (error) {
    console.error("Error creating collection:", error)
    throw error
  }
}

export async function updateCollection(id: string, collectionData: any): Promise<Collection | null> {
  try {
    const formattedId = id.includes("gid://") ? id : `gid://shopify/Collection/${id}`

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

    const input = {
      id: formattedId,
      title: collectionData.title,
      descriptionHtml: collectionData.description || collectionData.descriptionHtml,
    }

    const response = await shopifyFetch({
      query: mutation,
      variables: { input },
    })

    if (response.errors || response.data?.collectionUpdate?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.collectionUpdate?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return response.data?.collectionUpdate?.collection || null
  } catch (error) {
    console.error("Error updating collection:", error)
    throw error
  }
}

export async function deleteCollection(id: string): Promise<boolean> {
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

    const response = await shopifyFetch({
      query: mutation,
      variables: {
        input: { id: formattedId },
      },
    })

    if (response.errors || response.data?.collectionDelete?.userErrors?.length > 0) {
      const errorMessage = response.errors?.[0]?.message || response.data?.collectionDelete?.userErrors?.[0]?.message
      throw new Error(errorMessage)
    }

    return !!response.data?.collectionDelete?.deletedCollectionId
  } catch (error) {
    console.error("Error deleting collection:", error)
    throw error
  }
}
