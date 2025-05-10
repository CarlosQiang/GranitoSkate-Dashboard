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
  products?: {
    edges: {
      node: {
        id: string
        title: string
      }
    }[]
  }
  seo: {
    title: string
    description: string
  }
}

// Consulta para obtener colecciones
const GET_COLLECTIONS = `
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
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
          seo {
            title
            description
          }
        }
      }
    }
  }
`

// Función para obtener colecciones
export async function getCollections(
  first = 10,
  after?: string,
): Promise<{
  collections: Collection[]
  pageInfo: { hasNextPage: boolean; endCursor: string }
}> {
  try {
    const data = await shopifyFetch({
      query: GET_COLLECTIONS,
      variables: { first, after },
    })

    const collections = data.collections.edges.map((edge: any) => edge.node)
    const pageInfo = data.collections.pageInfo

    return { collections, pageInfo }
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    throw error
  }
}

// Consulta para obtener una colección por ID
const GET_COLLECTION_BY_ID = `
  query GetCollectionById($id: ID!) {
    collection(id: $id) {
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
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
`

// Función para obtener una colección por ID
export async function getCollectionById(id: string): Promise<Collection | null> {
  try {
    const data = await shopifyFetch({
      query: GET_COLLECTION_BY_ID,
      variables: { id },
    })

    return data.collection
  } catch (error) {
    console.error("Error al obtener la colección:", error)
    throw error
  }
}

// Consulta para crear una colección
const CREATE_COLLECTION = `
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

// Función para crear una colección
export async function createCollection(collectionData: {
  title: string
  description: string
  seo?: { title?: string; description?: string }
}): Promise<any> {
  try {
    const data = await shopifyFetch({
      query: CREATE_COLLECTION,
      variables: {
        input: collectionData,
      },
    })

    if (data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return data.collectionCreate.collection
  } catch (error) {
    console.error("Error al crear la colección:", error)
    throw error
  }
}

// Consulta para actualizar una colección
const UPDATE_COLLECTION = `
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

// Función para actualizar una colección
export async function updateCollection(
  id: string,
  collectionData: {
    title?: string
    description?: string
    seo?: { title?: string; description?: string }
  },
): Promise<any> {
  try {
    const data = await shopifyFetch({
      query: UPDATE_COLLECTION,
      variables: {
        input: {
          id,
          ...collectionData,
        },
      },
    })

    if (data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return data.collectionUpdate.collection
  } catch (error) {
    console.error("Error al actualizar la colección:", error)
    throw error
  }
}

// Consulta para añadir productos a una colección
const ADD_PRODUCTS_TO_COLLECTION = `
  mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(collectionId: $id, productIds: $productIds) {
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

// Función para añadir productos a una colección
export async function addProductsToCollection(collectionId: string, productIds: string[]): Promise<any> {
  try {
    const data = await shopifyFetch({
      query: ADD_PRODUCTS_TO_COLLECTION,
      variables: {
        id: collectionId,
        productIds,
      },
    })

    if (data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(data.collectionAddProducts.userErrors[0].message)
    }

    return data.collectionAddProducts.collection
  } catch (error) {
    console.error("Error al añadir productos a la colección:", error)
    throw error
  }
}

// Consulta para eliminar productos de una colección
const REMOVE_PRODUCTS_FROM_COLLECTION = `
  mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
    collectionRemoveProducts(collectionId: $id, productIds: $productIds) {
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

// Función para eliminar productos de una colección
export async function removeProductsFromCollection(collectionId: string, productIds: string[]): Promise<any> {
  try {
    const data = await shopifyFetch({
      query: REMOVE_PRODUCTS_FROM_COLLECTION,
      variables: {
        id: collectionId,
        productIds,
      },
    })

    if (data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(data.collectionRemoveProducts.userErrors[0].message)
    }

    return data.collectionRemoveProducts.collection
  } catch (error) {
    console.error("Error al eliminar productos de la colección:", error)
    throw error
  }
}
