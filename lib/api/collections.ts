import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchCollections(limit = 20) {
  try {
    const query = gql`
      query GetCollections($limit: Int!) {
        collections(first: $limit) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              productsCount
              image {
                url
                altText
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { limit })

    // Transformar los datos para un formato más fácil de usar
    const collections = data.collections.edges.map((edge) => {
      const node = edge.node
      return {
        id: node.id.split("/").pop(), // Extraer el ID numérico
        title: node.title,
        handle: node.handle,
        descriptionHtml: node.descriptionHtml,
        productsCount: node.productsCount,
        image: node.image?.url || null,
      }
    })

    return collections
  } catch (error) {
    console.error("Error al cargar colecciones:", error)
    throw new Error(`Error al cargar colecciones: ${error.message}`)
  }
}

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
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
                variants(first: 1) {
                  edges {
                    node {
                      price
                      compareAtPrice
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
    const collection = data.collection
    const products = collection.products.edges.map((edge) => {
      const node = edge.node
      const variant = node.variants.edges[0]?.node || {}
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        handle: node.handle,
        image: node.featuredImage?.url || null,
        price: variant.price || "0.00",
        compareAtPrice: variant.compareAtPrice || null,
      }
    })

    return {
      id: collection.id.split("/").pop(),
      title: collection.title,
      handle: collection.handle,
      descriptionHtml: collection.descriptionHtml,
      productsCount: collection.productsCount,
      image: collection.image?.url || null,
      products,
    }
  } catch (error) {
    console.error(`Error al cargar la colección ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${error.message}`)
  }
}

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
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionCreate.userErrors && data.collectionCreate.userErrors.length > 0) {
      throw new Error(data.collectionCreate.userErrors[0].message)
    }

    return {
      id: data.collectionCreate.collection.id.split("/").pop(),
      title: data.collectionCreate.collection.title,
      handle: data.collectionCreate.collection.handle,
    }
  } catch (error) {
    console.error("Error al crear la colección:", error)
    throw new Error(`Error al crear la colección: ${error.message}`)
  }
}

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

    const input = {
      id: formattedId,
      title: collectionData.title,
      descriptionHtml: collectionData.descriptionHtml || "",
    }

    // Añadir imagen solo si se proporciona
    if (collectionData.image) {
      input.image = { src: collectionData.image }
    }

    const variables = { input }

    const data = await shopifyClient.request(mutation, variables)

    if (data.collectionUpdate.userErrors && data.collectionUpdate.userErrors.length > 0) {
      throw new Error(data.collectionUpdate.userErrors[0].message)
    }

    return {
      id: data.collectionUpdate.collection.id.split("/").pop(),
      title: data.collectionUpdate.collection.title,
      handle: data.collectionUpdate.collection.handle,
    }
  } catch (error) {
    console.error(`Error al actualizar la colección ${id}:`, error)
    throw new Error(`Error al actualizar la colección: ${error.message}`)
  }
}

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

export async function getProductsInCollection(collectionId, limit = 20) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    const query = gql`
      query GetProductsInCollection($collectionId: ID!, $limit: Int!) {
        collection(id: $collectionId) {
          products(first: $limit) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
                variants(first: 1) {
                  edges {
                    node {
                      price
                      compareAtPrice
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { collectionId: formattedId, limit })

    if (!data.collection) {
      throw new Error(`No se encontró la colección con ID: ${collectionId}`)
    }

    // Transformar los datos para un formato más fácil de usar
    const products = data.collection.products.edges.map((edge) => {
      const node = edge.node
      const variant = node.variants.edges[0]?.node || {}
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        handle: node.handle,
        image: node.featuredImage?.url || null,
        price: variant.price || "0.00",
        compareAtPrice: variant.compareAtPrice || null,
      }
    })

    return products
  } catch (error) {
    console.error(`Error al cargar productos de la colección ${collectionId}:`, error)
    throw new Error(`Error al cargar productos de la colección: ${error.message}`)
  }
}

export async function getCollectionsForProduct(productId, limit = 20) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = productId.includes("gid://shopify/Product/") ? productId : `gid://shopify/Product/${productId}`

    const query = gql`
      query GetCollectionsForProduct($productId: ID!, $limit: Int!) {
        product(id: $productId) {
          collections(first: $limit) {
            edges {
              node {
                id
                title
                handle
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { productId: formattedId, limit })

    if (!data.product) {
      throw new Error(`No se encontró el producto con ID: ${productId}`)
    }

    // Transformar los datos para un formato más fácil de usar
    const collections = data.product.collections.edges.map((edge) => {
      const node = edge.node
      return {
        id: node.id.split("/").pop(),
        title: node.title,
        handle: node.handle,
        image: node.image?.url || null,
      }
    })

    return collections
  } catch (error) {
    console.error(`Error al cargar colecciones del producto ${productId}:`, error)
    throw new Error(`Error al cargar colecciones del producto: ${error.message}`)
  }
}
