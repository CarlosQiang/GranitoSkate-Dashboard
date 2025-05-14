import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

/**
 * Interfaz para los parámetros de búsqueda de colecciones
 */
interface ParametrosBusquedaColeccion {
  consulta?: string
  limite?: number
  pagina?: number
}

/**
 * Obtiene todas las colecciones o filtra por consulta
 * @param params Parámetros opcionales de búsqueda
 * @returns Lista de colecciones
 */
export async function obtenerColecciones(params: ParametrosBusquedaColeccion = {}) {
  try {
    // Construir la consulta GraphQL simplificada
    const query = gql`
      query {
        collections(first: ${params.limite || 20}) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              productsCount
              updatedAt
              image {
                url
              }
            }
          }
        }
      }
    `

    // Ejecutar la consulta
    const data = await shopifyClient.request(query)

    // Mapear los resultados
    return data.collections.edges.map((edge) => {
      const node = edge.node
      return {
        id: node.id,
        titulo: node.title,
        handle: node.handle,
        descripcion: node.descriptionHtml,
        productoCount: node.productsCount,
        fechaActualizacion: node.updatedAt,
        image: node.image,
      }
    })
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    throw new Error(`Error al obtener colecciones: ${error.message}`)
  }
}

/**
 * Obtiene una colección por su ID
 * @param id ID de la colección
 * @returns Datos de la colección o null si no existe
 */
export async function obtenerColeccionPorId(id) {
  try {
    // Construir la consulta GraphQL simplificada
    const query = gql`
      query {
        collection(id: "gid://shopify/Collection/${id}") {
          id
          title
          handle
          descriptionHtml
          productsCount
          updatedAt
          image {
            url
          }
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      }
    `

    // Ejecutar la consulta
    const data = await shopifyClient.request(query)

    // Si no hay colección, devolver null
    if (!data.collection) {
      return null
    }

    const collection = data.collection
    return {
      id: collection.id,
      titulo: collection.title,
      handle: collection.handle,
      descripcion: collection.descriptionHtml,
      productoCount: collection.productsCount,
      fechaActualizacion: collection.updatedAt,
      image: collection.image,
      productos: collection.products.edges.map((edge) => edge.node.id),
    }
  } catch (error) {
    console.error(`Error al obtener colección ${id}:`, error)
    throw new Error(`Error al obtener colección: ${error.message}`)
  }
}

/**
 * Crea una nueva colección
 * @param datos Datos de la colección a crear
 * @returns La colección creada
 */
export async function crearColeccion(datos) {
  try {
    // Construir la mutación GraphQL
    const mutation = gql`
      mutation CollectionCreate($input: CollectionInput!) {
        collectionCreate(input: $input) {
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

    // Construir variables para la mutación
    const variables = {
      input: {
        title: datos.titulo,
        descriptionHtml: datos.descripcion,
      },
    }

    // Ejecutar la mutación
    const data = await shopifyClient.request(mutation, variables)

    // Verificar errores
    if (data.collectionCreate.userErrors && data.collectionCreate.userErrors.length > 0) {
      throw new Error(`Error al crear colección: ${data.collectionCreate.userErrors[0].message}`)
    }

    return {
      id: data.collectionCreate.collection.id,
      titulo: data.collectionCreate.collection.title,
    }
  } catch (error) {
    console.error("Error al crear colección:", error)
    throw new Error(`Error al crear colección: ${error.message}`)
  }
}

/**
 * Añade productos a una colección
 * @param collectionId ID de la colección
 * @param productIds Array de IDs de productos
 * @returns Resultado de la operación
 */
export async function addProductsToCollection(collectionId, productIds) {
  try {
    // Asegurarse de que los IDs estén en el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    const formattedProductIds = productIds.map((id) =>
      id.includes("gid://shopify/") ? id : `gid://shopify/Product/${id}`,
    )

    // Construir la mutación GraphQL
    const mutation = gql`
      mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(collectionId: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Ejecutar la mutación
    const data = await shopifyClient.request(mutation, {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    })

    // Verificar errores
    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(`Error al añadir productos: ${data.collectionAddProducts.userErrors[0].message}`)
    }

    return {
      success: true,
      collection: {
        id: data.collectionAddProducts.collection.id,
        title: data.collectionAddProducts.collection.title,
        productsCount: data.collectionAddProducts.collection.productsCount,
      },
    }
  } catch (error) {
    console.error("Error al añadir productos a la colección:", error)
    throw new Error(`Error al añadir productos: ${error.message}`)
  }
}

/**
 * Elimina productos de una colección
 * @param collectionId ID de la colección
 * @param productIds Array de IDs de productos
 * @returns Resultado de la operación
 */
export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    // Asegurarse de que los IDs estén en el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    const formattedProductIds = productIds.map((id) =>
      id.includes("gid://shopify/") ? id : `gid://shopify/Product/${id}`,
    )

    // Construir la mutación GraphQL
    const mutation = gql`
      mutation CollectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(collectionId: $id, productIds: $productIds) {
          collection {
            id
            title
            productsCount
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Ejecutar la mutación
    const data = await shopifyClient.request(mutation, {
      id: formattedCollectionId,
      productIds: formattedProductIds,
    })

    // Verificar errores
    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(`Error al eliminar productos: ${data.collectionRemoveProducts.userErrors[0].message}`)
    }

    return {
      success: true,
      collection: {
        id: data.collectionRemoveProducts.collection.id,
        title: data.collectionRemoveProducts.collection.title,
        productsCount: data.collectionRemoveProducts.collection.productsCount,
      },
    }
  } catch (error) {
    console.error("Error al eliminar productos de la colección:", error)
    throw new Error(`Error al eliminar productos: ${error.message}`)
  }
}

/**
 * Obtiene los productos de una colección
 * @param collectionId ID de la colección
 * @returns Lista de productos de la colección
 */
export async function fetchCollectionProducts(collectionId) {
  try {
    // Asegurarse de que el ID esté en el formato correcto
    const formattedCollectionId = collectionId.includes("gid://shopify/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    // Construir la consulta GraphQL
    const query = gql`
      query GetCollectionProducts($collectionId: ID!) {
        collection(id: $collectionId) {
          products(first: 250) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                status
              }
            }
          }
        }
      }
    `

    // Ejecutar la consulta
    const data = await shopifyClient.request(query, {
      collectionId: formattedCollectionId,
    })

    // Si no hay colección o productos, devolver un array vacío
    if (!data.collection || !data.collection.products) {
      return { edges: [] }
    }

    return data.collection.products
  } catch (error) {
    console.error(`Error al obtener productos de la colección ${collectionId}:`, error)
    throw new Error(`Error al obtener productos de la colección: ${error.message}`)
  }
}

// Importar las funciones de collections.ts
import {
  fetchCollections,
  fetchCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
} from "./collections"

// Exportar las funciones con nombres en español
export const obtenerColeccionesDesdeArchivo = fetchCollections
export const obtenerColeccionPorIdDesdeArchivo = fetchCollectionById
export const crearColeccionDesdeArchivo = createCollection
export const actualizarColeccion = updateCollection
export const eliminarColeccion = deleteCollection
export const agregarProductosAColeccion = addProductsToCollection
export const eliminarProductosDeColeccion = removeProductsFromCollection

// Re-exportar las funciones originales para mantener compatibilidad
export { fetchCollections, fetchCollectionById, createCollection, updateCollection, deleteCollection }
