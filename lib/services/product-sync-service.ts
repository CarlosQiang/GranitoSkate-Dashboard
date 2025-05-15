import { Logger } from "next-axiom"
import { shopifyFetch } from "@/lib/shopify-client"
import { syncProductWithDb, type ShopifyProduct } from "@/lib/repositories/product-repository"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"

const logger = new Logger({
  source: "product-sync-service",
})

// Función para sincronizar todos los productos de Shopify
export async function syncAllProducts(limit = 250): Promise<{
  created: number
  updated: number
  failed: number
  total: number
}> {
  try {
    logger.info("Iniciando sincronización de productos", { limit })

    // Obtener productos de Shopify
    const shopifyProducts = await fetchProductsFromShopify(limit)

    if (!shopifyProducts || shopifyProducts.length === 0) {
      logger.warn("No se encontraron productos en Shopify")

      await logSyncEvent({
        tipo_entidad: "PRODUCT",
        accion: "SYNC_ALL",
        resultado: "WARNING",
        mensaje: "No se encontraron productos en Shopify",
      })

      return { created: 0, updated: 0, failed: 0, total: 0 }
    }

    // Contadores para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada producto
    for (const product of shopifyProducts) {
      try {
        // Verificar si el producto ya existe en la base de datos
        const existingProduct = await checkProductExists(product.id)

        // Sincronizar el producto con la base de datos
        await syncProductWithDb(product)

        if (existingProduct) {
          updated++
        } else {
          created++
        }
      } catch (error) {
        logger.error("Error al sincronizar producto", {
          productId: product.id,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "PRODUCT",
          entidad_id: product.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de productos completada: ${created} creados, ${updated} actualizados, ${failed} fallidos`,
    })

    logger.info("Sincronización de productos completada", { created, updated, failed, total: shopifyProducts.length })

    return { created, updated, failed, total: shopifyProducts.length }
  } catch (error) {
    logger.error("Error al sincronizar productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar productos: ${error instanceof Error ? error.message : "Error desconocido"}`,
    })

    throw error
  }
}

// Función para obtener productos de Shopify
async function fetchProductsFromShopify(limit = 250): Promise<ShopifyProduct[]> {
  try {
    const query = `
      query GetProducts($limit: Int!) {
        products(first: $limit) {
          edges {
            node {
              id
              title
              description
              handle
              productType
              vendor
              status
              tags
              featuredImage {
                url
                altText
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    requiresShipping
                    weight
                    weightUnit
                    position
                  }
                }
              }
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                    position
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                    type
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      limit,
    }

    const { data, errors } = await shopifyFetch({ query, variables })

    if (errors) {
      logger.error("Error al obtener productos de Shopify", { errors })
      throw new Error(`Error al obtener productos de Shopify: ${errors[0].message}`)
    }

    if (!data || !data.products || !data.products.edges) {
      logger.warn("Respuesta de Shopify no contiene productos")
      return []
    }

    // Transformar los datos al formato esperado
    return data.products.edges.map((edge) => {
      const node = edge.node

      return {
        id: node.id,
        title: node.title,
        description: node.description,
        handle: node.handle,
        productType: node.productType,
        vendor: node.vendor,
        status: node.status,
        tags: node.tags,
        featuredImage: node.featuredImage,
        variants: node.variants.edges.map((variantEdge) => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          price: variantEdge.node.price,
          compareAtPrice: variantEdge.node.compareAtPrice,
          sku: variantEdge.node.sku,
          barcode: variantEdge.node.barcode,
          inventoryQuantity: variantEdge.node.inventoryQuantity,
          inventoryPolicy: variantEdge.node.inventoryPolicy,
          requiresShipping: variantEdge.node.requiresShipping,
          weight: variantEdge.node.weight,
          weightUnit: variantEdge.node.weightUnit,
          position: variantEdge.node.position,
        })),
        images: node.images.edges.map((imageEdge) => ({
          id: imageEdge.node.id,
          src: imageEdge.node.url,
          alt: imageEdge.node.altText,
          position: imageEdge.node.position,
        })),
        metafields: node.metafields.edges.map((metafieldEdge) => ({
          id: metafieldEdge.node.id,
          namespace: metafieldEdge.node.namespace,
          key: metafieldEdge.node.key,
          value: metafieldEdge.node.value,
          type: metafieldEdge.node.type,
        })),
      }
    })
  } catch (error) {
    logger.error("Error al obtener productos de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Verificar si un producto existe en la base de datos
async function checkProductExists(shopifyId: string): Promise<boolean> {
  try {
    const result = await import("@/lib/db/neon-client").then((module) =>
      module.executeQuery(`SELECT id FROM productos WHERE shopify_id = $1`, [shopifyId.split("/").pop()]),
    )

    return result.length > 0
  } catch (error) {
    logger.error("Error al verificar existencia de producto", {
      shopifyId,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    return false
  }
}

// Sincronizar un producto específico por ID
export async function syncProductById(productId: string): Promise<boolean> {
  try {
    logger.info("Sincronizando producto específico", { productId })

    // Obtener producto de Shopify
    const product = await fetchProductById(productId)

    if (!product) {
      logger.error("Producto no encontrado en Shopify", { productId })
      return false
    }

    // Sincronizar el producto con la base de datos
    await syncProductWithDb(product)

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: productId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Producto sincronizado: ${product.title}`,
    })

    logger.info("Producto sincronizado correctamente", { productId })

    return true
  } catch (error) {
    logger.error("Error al sincronizar producto específico", {
      productId,
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: productId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
    })

    return false
  }
}

// Obtener un producto específico de Shopify por ID
async function fetchProductById(productId: string): Promise<ShopifyProduct | null> {
  try {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          handle
          productType
          vendor
          status
          tags
          featuredImage {
            url
            altText
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                barcode
                inventoryQuantity
                inventoryPolicy
                requiresShipping
                weight
                weightUnit
                position
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
                position
              }
            }
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
                type
              }
            }
          }
        }
      }
    `

    const variables = {
      id: productId.includes("gid://") ? productId : `gid://shopify/Product/${productId}`,
    }

    const { data, errors } = await shopifyFetch({ query, variables })

    if (errors) {
      logger.error("Error al obtener producto de Shopify", { productId, errors })
      throw new Error(`Error al obtener producto de Shopify: ${errors[0].message}`)
    }

    if (!data || !data.product) {
      logger.warn("Producto no encontrado en Shopify", { productId })
      return null
    }

    const product = data.product

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      productType: product.productType,
      vendor: product.vendor,
      status: product.status,
      tags: product.tags,
      featuredImage: product.featuredImage,
      variants: product.variants.edges.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        price: edge.node.price,
        compareAtPrice: edge.node.compareAtPrice,
        sku: edge.node.sku,
        barcode: edge.node.barcode,
        inventoryQuantity: edge.node.inventoryQuantity,
        inventoryPolicy: edge.node.inventoryPolicy,
        requiresShipping: edge.node.requiresShipping,
        weight: edge.node.weight,
        weightUnit: edge.node.weightUnit,
        position: edge.node.position,
      })),
      images: product.images.edges.map((edge) => ({
        id: edge.node.id,
        src: edge.node.url,
        alt: edge.node.altText,
        position: edge.node.position,
      })),
      metafields: product.metafields.edges.map((edge) => ({
        id: edge.node.id,
        namespace: edge.node.namespace,
        key: edge.node.key,
        value: edge.node.value,
        type: edge.node.type,
      })),
    }
  } catch (error) {
    logger.error("Error al obtener producto de Shopify", {
      productId,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}
