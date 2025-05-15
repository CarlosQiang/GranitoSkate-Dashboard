import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

/**
 * Interfaz para los parámetros de búsqueda de productos
 */
interface ParametrosBusquedaProducto {
  consulta?: string
  coleccionId?: string
  limite?: number
  pagina?: number
  ordenarPor?: string
}

/**
 * Obtiene todos los productos o filtra por consulta
 * @param params Parámetros opcionales de búsqueda
 * @returns Lista de productos
 */
export async function obtenerProductos(params: ParametrosBusquedaProducto = {}) {
  try {
    // Construir la consulta GraphQL
    const query = gql`
      query GetProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              productType
              vendor
              status
              totalInventory
              createdAt
              updatedAt
              tags
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `

    // Construir variables para la consulta
    const variables = {
      first: params.limite || 20,
      query: params.consulta || "",
      sortKey: params.ordenarPor ? params.ordenarPor.toUpperCase() : "TITLE",
      reverse: false,
    }

    // Si hay un ID de colección, añadirlo a la consulta
    if (params.coleccionId) {
      variables.query += ` collection_id:${params.coleccionId}`
    }

    // Ejecutar la consulta
    const data = await shopifyClient.request(query, variables)

    // Mapear los resultados
    return data.products.edges.map((edge) => {
      const node = edge.node
      const variant = node.variants.edges[0]?.node
      const image = node.images.edges[0]?.node

      return {
        id: node.id,
        titulo: node.title,
        handle: node.handle,
        descripcion: node.description || node.descriptionHtml,
        tipo: node.productType,
        vendedor: node.vendor,
        estado: node.status,
        inventario: node.totalInventory,
        fechaCreacion: node.createdAt,
        fechaActualizacion: node.updatedAt,
        etiquetas: node.tags,
        precio: variant?.price || "0.00",
        comparacionPrecio: variant?.compareAtPrice || null,
        sku: variant?.sku || "",
        imagen: image?.url || null,
        imagenes: [
          {
            id: image?.id,
            src: image?.url,
            alt: image?.altText,
          },
        ],
      }
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw new Error(`Error al obtener productos: ${error.message}`)
  }
}

/**
 * Obtiene un producto por su ID
 * @param id ID del producto
 * @returns Datos del producto o null si no existe
 */
export async function obtenerProductoPorId(id) {
  try {
    // Construir la consulta GraphQL
    const query = gql`
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          descriptionHtml
          productType
          vendor
          status
          totalInventory
          createdAt
          updatedAt
          tags
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                inventoryQuantity
              }
            }
          }
        }
      }
    `

    // Ejecutar la consulta
    const data = await shopifyClient.request(query, { id: `gid://shopify/Product/${id}` })

    // Si no hay producto, devolver null
    if (!data.product) {
      return null
    }

    const product = data.product
    const variants = product.variants.edges.map((edge) => edge.node)
    const images = product.images.edges.map((edge) => edge.node)

    return {
      id: product.id,
      titulo: product.title,
      handle: product.handle,
      descripcion: product.description || product.descriptionHtml,
      tipo: product.productType,
      vendedor: product.vendor,
      estado: product.status,
      inventario: product.totalInventory,
      fechaCreacion: product.createdAt,
      fechaActualizacion: product.updatedAt,
      etiquetas: product.tags,
      precio: variants[0]?.price || "0.00",
      comparacionPrecio: variants[0]?.compareAtPrice || null,
      sku: variants[0]?.sku || "",
      imagen: images[0]?.url || null,
      imagenes: images.map((img) => ({
        id: img.id,
        src: img.url,
        alt: img.altText,
      })),
      variantes: variants.map((variant) => ({
        id: variant.id,
        titulo: variant.title,
        precio: variant.price,
        comparacionPrecio: variant.compareAtPrice,
        sku: variant.sku,
        inventario: variant.inventoryQuantity,
      })),
    }
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error)
    throw new Error(`Error al obtener producto: ${error.message}`)
  }
}

/**
 * Crea un nuevo producto
 * @param datos Datos del producto a crear
 * @returns El producto creado
 */
export async function crearProducto(datos) {
  try {
    // Construir la mutación GraphQL
    const mutation = gql`
      mutation ProductCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
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
        productType: datos.tipo,
        vendor: datos.vendedor,
        tags: datos.etiquetas,
        variants: [
          {
            price: datos.precio,
            compareAtPrice: datos.comparacionPrecio,
            sku: datos.sku,
            inventoryQuantities: {
              availableQuantity: datos.inventario,
              locationId: "gid://shopify/Location/1",
            },
          },
        ],
      },
    }

    // Ejecutar la mutación
    const data = await shopifyClient.request(mutation, variables)

    // Verificar errores
    if (data.productCreate.userErrors && data.productCreate.userErrors.length > 0) {
      throw new Error(`Error al crear producto: ${data.productCreate.userErrors[0].message}`)
    }

    return {
      id: data.productCreate.product.id,
      titulo: data.productCreate.product.title,
    }
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw new Error(`Error al crear producto: ${error.message}`)
  }
}

// Alias para compatibilidad
export const fetchProducts = obtenerProductos
export const fetchProductById = obtenerProductoPorId
export const createProduct = crearProducto
