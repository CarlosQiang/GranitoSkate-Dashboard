import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las colecciones
export async function fetchCollections(first = 20) {
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
                altText
              }
              products(first: 5) {
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

    const data = await shopifyClient.request(query, { first })

    // Transformar los datos para un formato más fácil de usar
    const collections = data.collections.edges.map((edge) => {
      const node = edge.node
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        productsCount: node.productsCount || 0,
        image: node.image,
        products: node.products.edges.map((productEdge) => ({
          id: productEdge.node.id,
          title: productEdge.node.title,
        })),
      }
    })

    return collections
  } catch (error) {
    console.error("Error al cargar colecciones:", error)
    throw new Error(`Error al cargar colecciones: ${error.message}`)
  }
}

// Función para obtener una colección por ID
export async function fetchCollectionById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
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
                featuredImage {
                  url
                  altText
                }
                variants(first: 1) {
                  edges {
                    node {
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
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

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data.collection) {
      throw new Error(`No se encontró la colección con ID: ${id}`)
    }

    // Transformar los datos para un formato más fácil de usar
    const collection = {
      id: data.collection.id,
      title: data.collection.title,
      handle: data.collection.handle,
      description: data.collection.descriptionHtml,
      productsCount: data.collection.productsCount || 0,
      image: data.collection.image,
      products: data.collection.products.edges.map((edge) => {
        const variant = edge.node.variants.edges[0]?.node || {}
        return {
          id: edge.node.id,
          title: edge.node.title,
          image: edge.node.featuredImage,
          price: variant.price?.amount || "0.00",
          currencyCode: variant.price?.currencyCode || "EUR",
          compareAtPrice: variant.compareAtPrice?.amount,
        }
      }),
    }

    return collection
  } catch (error) {
    console.error(`Error al cargar la colección ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${error.message}`)
  }
}

// Función para crear una nueva colección
export async function createCollection(collectionData) {
  try {
    const mutation = gql`
      mutation CreateCollection($input: CollectionInput!) {
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
        image: collectionData.image ? { src: collectionData.image } : null,
        seo: {
          title: collectionData.seoTitle || collectionData.title,
          description: collectionData.seoDescription || collectionData.description || "",
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionCreate.userErrors && data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return {
      id: data.collectionCreate.collection.id,
      title: data.collectionCreate.collection.title,
      handle: data.collectionCreate.collection.handle,
    }
  } catch (error) {
    console.error("Error al crear la colección:", error)
    throw new Error(`Error al crear la colección: ${error.message}`)
  }
}

// Función para actualizar una colección
export async function updateCollection(id, collectionData) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const mutation = gql`
      mutation UpdateCollection($input: CollectionInput!) {
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
        title: collectionData.title,
        descriptionHtml: collectionData.description || "",
        image: collectionData.image ? { src: collectionData.image } : null,
        seo: {
          title: collectionData.seoTitle || collectionData.title,
          description: collectionData.seoDescription || collectionData.description || "",
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionUpdate.userErrors && data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return {
      id: data.collectionUpdate.collection.id,
      title: data.collectionUpdate.collection.title,
      handle: data.collectionUpdate.collection.handle,
    }
  } catch (error) {
    console.error(`Error al actualizar la colección ${id}:`, error)
    throw new Error(`Error al actualizar la colección: ${error.message}`)
  }
}

// Función para eliminar una colección
export async function deleteCollection(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const mutation = gql`
      mutation DeleteCollection($input: CollectionDeleteInput!) {
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

    if (data.collectionDelete.userErrors && data.collectionDelete.userErrors.length > 0) {
      throw new Error(data.collectionDelete.userErrors[0].message)
    }

    return {
      id: data.collectionDelete.deletedCollectionId,
    }
  } catch (error) {
    console.error(`Error al eliminar la colección ${id}:`, error)
    throw new Error(`Error al eliminar la colección: ${error.message}`)
  }
}

// Función para añadir productos a una colección
export async function addProductsToCollection(collectionId, productIds) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    // Formatear los IDs de los productos
    const formattedProductIds = productIds.map((id) =>
      id.includes("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`,
    )

    const mutation = gql`
      mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
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

    const variables = {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(data.collectionAddProducts.userErrors[0].message)
    }

    return {
      id: data.collectionAddProducts.collection.id,
      title: data.collectionAddProducts.collection.title,
    }
  } catch (error) {
    console.error(`Error al añadir productos a la colección ${collectionId}:`, error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

// Función para eliminar productos de una colección
export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    // Formatear los IDs de los productos
    const formattedProductIds = productIds.map((id) =>
      id.includes("gid://shopify/Product/") ? id : `gid://shopify/Product/${id}`,
    )

    const mutation = gql`
      mutation CollectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
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

    const variables = {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(data.collectionRemoveProducts.userErrors[0].message)
    }

    return {
      id: data.collectionRemoveProducts.collection.id,
      title: data.collectionRemoveProducts.collection.title,
    }
  } catch (error) {
    console.error(`Error al eliminar productos de la colección ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}
