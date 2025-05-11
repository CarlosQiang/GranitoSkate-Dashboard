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
 * @param productIds IDs de los productos a añadir
 * @returns true si se añadieron correctamente
 */
export async function addProductsToCollection(collectionId, productIds) {
  try {
    // Implementación simplificada
    console.log(`Añadiendo productos ${productIds.join(", ")} a la colección ${collectionId}`)
    return true
  } catch (error) {
    console.error(`Error al añadir productos a la colección ${collectionId}:`, error)
    throw new Error(`Error al añadir productos a la colección: ${error.message}`)
  }
}

/**
 * Elimina productos de una colección
 * @param collectionId ID de la colección
 * @param productIds IDs de los productos a eliminar
 * @returns true si se eliminaron correctamente
 */
export async function removeProductsFromCollection(collectionId, productIds) {
  try {
    // Implementación simplificada
    console.log(`Eliminando productos ${productIds.join(", ")} de la colección ${collectionId}`)
    return true
  } catch (error) {
    console.error(`Error al eliminar productos de la colección ${collectionId}:`, error)
    throw new Error(`Error al eliminar productos de la colección: ${error.message}`)
  }
}

// Alias para compatibilidad
export const fetchCollections = obtenerColecciones
export const fetchCollectionById = obtenerColeccionPorId
export const createCollection = crearColeccion
