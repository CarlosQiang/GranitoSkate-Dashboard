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
        id: node.id.split("/").pop(), // Extraer el ID numérico
        title: node.title,
        handle: node.handle,
        productsCount: node.productsCount || 0,
        image: node.image,
        products: node.products.edges.map((productEdge) => ({
          id: productEdge.node.id.split("/").pop(),
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

// Obtener una colección por ID
export async function fetchCollectionById(collectionId) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    console.log("Obteniendo colección con ID:", formattedId)

    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          description
          handle
          updatedAt
          image {
            id
            url
            altText
          }
          products(first: 100) {
            edges {
              node {
                id
                title
                status
                featuredImage {
                  id
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

    if (!data?.collection) {
      console.error("No se encontró la colección:", formattedId)
      return null
    }

    // Transformar los productos para tener un formato más sencillo
    const products = data.collection.products.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      status: edge.node.status,
      image: edge.node.featuredImage,
    }))

    // Devolver la colección con los productos en formato plano
    return {
      ...data.collection,
      products,
    }
  } catch (error) {
    console.error("Error fetching collection by ID:", error)
    throw new Error(`Error al obtener la colección: ${error.message}`)
  }
}

// Resto de funciones para colecciones...
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
      id: data.collectionAddProducts.collection.id.split("/").pop(),
      title: data.collectionAddProducts.collection.title,
    }
  } catch (error) {
    console.error(`Error al añadir productos a la colección ${collectionId}:`, error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

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
      id: data.collectionRemoveProducts.collection.id.split("/").pop(),
      title: data.collectionRemoveProducts.collection.title,
    }
  } catch (error) {
    console.error(`Error al eliminar productos de la colección ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}
