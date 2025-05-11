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
    // Construir la consulta GraphQL
    const query = gql`
      query GetCollections($first: Int!, $query: String) {
        collections(first: $first, query: $query) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              productsCount
              image {
                id
                url
                altText
              }
              updatedAt
              productsCount
            }
          }
        }
      }
    `

    // Construir variables para la consulta
    const variables = {
      first: params.limite || 20,
      query: params.consulta || "",
    }

    // Ejecutar la consulta
    const data = await shopifyClient.request(query, variables)

    // Mapear los resultados
    return data.collections.edges.map((edge) => {
      const node = edge.node
      return {
        id: node.id,
        titulo: node.title,
        handle: node.handle,
        descripcion: node.descriptionHtml,
        imagen: node.image?.url || null,
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
    // Construir la consulta GraphQL
    const query = gql`
      query GetCollection($id: ID!) {
        collection(id: $id) {
          id
          title
          handle
          descriptionHtml
          productsCount
          image {
            id
            url
            altText
          }
          updatedAt
        }
      }
    `

    // Ejecutar la consulta
    const data = await shopifyClient.request(query, { id: `gid://shopify/Collection/${id}` })

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
      imagen: collection.image?.url || null,
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
        image: datos.imagen ? { src: datos.imagen } : undefined,
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
    // Construir la mutación GraphQL
    const mutation = gql`
      mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
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

    // Formatear los IDs de productos
    const formattedProductIds = productIds.map((id) => `gid://shopify/Product/${id}`)

    // Ejecutar la mutación
    const data = await shopifyClient.request(mutation, {
      id: `gid://shopify/Collection/${collectionId}`,
      productIds: formattedProductIds,
    })

    // Verificar errores
    if (data.collectionAddProducts.userErrors && data.collectionAddProducts.userErrors.length > 0) {
      throw new Error(`Error al añadir productos: ${data.collectionAddProducts.userErrors[0].message}`)
    }

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
    // Construir la mutación GraphQL
    const mutation = gql`
      mutation CollectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
        collectionRemoveProducts(id: $id, productIds: $productIds) {
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

    // Formatear los IDs de productos
    const formattedProductIds = productIds.map((id) => `gid://shopify/Product/${id}`)

    // Ejecutar la mutación
    const data = await shopifyClient.request(mutation, {
      id: `gid://shopify/Collection/${collectionId}`,
      productIds: formattedProductIds,
    })

    // Verificar errores
    if (data.collectionRemoveProducts.userErrors && data.collectionRemoveProducts.userErrors.length > 0) {
      throw new Error(`Error al eliminar productos: ${data.collectionRemoveProducts.userErrors[0].message}`)
    }

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
