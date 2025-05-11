import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import { extractIdFromGid } from "@/lib/shopify"

/**
 * Obtiene todas las colecciones
 * @param options Opciones de filtrado
 * @returns Lista de colecciones
 */
export async function fetchCollections(options = {}) {
  try {
    const { limit = 20 } = options
    console.log(`Fetching collections with limit: ${limit}`)

    // Corregido: Eliminada la referencia a productsCount que causaba el error
    const query = `
      query {
        collections(first: ${limit}) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              image {
                url
                altText
              }
              products(first: 1) {
                edges {
                  node {
                    id
                  }
                }
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          }
        }
      }
    `

    console.log("Enviando consulta a Shopify...")

    // Usar el proxy en lugar de shopifyClient directamente
    const response = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta del proxy (${response.status}): ${errorText}`)
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("Errores GraphQL:", result.errors)
      throw new Error(result.errors[0]?.message || "Error en la consulta GraphQL")
    }

    const data = result.data

    // Verificar si la respuesta tiene la estructura esperada
    if (!data || !data.collections || !data.collections.edges) {
      console.error("Respuesta de colecciones incompleta:", data)
      return []
    }

    // Transformar los datos para un formato más fácil de usar
    const collections = data.collections.edges.map((edge) => {
      const node = edge.node

      // Calcular productsCount manualmente
      const productsCount = node.products?.edges?.length || 0

      return {
        id: extractIdFromGid(node.id),
        title: node.title,
        handle: node.handle,
        description: node.description || node.descriptionHtml || "",
        descriptionHtml: node.descriptionHtml || "",
        productsCount: productsCount,
        image: node.image,
      }
    })

    console.log(`Successfully fetched ${collections.length} collections`)
    return collections
  } catch (error) {
    console.error("Error al cargar colecciones:", error)
    throw new Error(`Error al cargar colecciones: ${(error as Error).message}`)
  }
}

// Función para obtener una colección por ID
export async function fetchCollectionById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const formattedId = id.includes("gid://shopify/Collection/") ? id : `gid://shopify/Collection/${id}`

    const query = `
      query {
        collection(id: "${formattedId}") {
          id
          title
          handle
          descriptionHtml
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

    // Usar el proxy en lugar de shopifyClient directamente
    const response = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta del proxy (${response.status}): ${errorText}`)
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("Errores GraphQL:", result.errors)
      throw new Error(result.errors[0]?.message || "Error en la consulta GraphQL")
    }

    const data = result.data

    if (!data || !data.collection) {
      throw new Error(`No se encontró la colección con ID: ${id}`)
    }

    // Transformar los datos para un formato más fácil de usar
    const collection = {
      id: data.collection.id.split("/").pop(),
      title: data.collection.title,
      handle: data.collection.handle,
      description: data.collection.descriptionHtml,
      productsCount: data.collection.products?.edges?.length || 0,
      image: data.collection.image,
      products: data.collection.products.edges.map((edge) => ({
        id: edge.node.id.split("/").pop(),
        title: edge.node.title,
        image: edge.node.featuredImage,
        price: edge.node.variants.edges[0]?.node.price || "0.00",
        currencyCode: "EUR", // Valor por defecto
      })),
    }

    return collection
  } catch (error) {
    console.error(`Error al cargar la colección ${id}:`, error)
    throw new Error(`Error al cargar la colección: ${error.message}`)
  }
}

// Alias para compatibilidad
export const getCollectionById = fetchCollectionById

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
      id: data.collectionCreate.collection.id.split("/").pop(),
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
      id: data.collectionUpdate.collection.id.split("/").pop(),
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
      id: data.collectionAddProducts.collection.id.split("/").pop(),
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
      id: data.collectionRemoveProducts.collection.id.split("/").pop(),
      title: data.collectionRemoveProducts.collection.title,
    }
  } catch (error) {
    console.error(`Error al eliminar productos de la colección ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}
