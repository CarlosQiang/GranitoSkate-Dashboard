import db from "@/lib/db/vercel-postgres"
import { extractIdFromGid } from "@/lib/shopify-client"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "productos-repository",
})

/**
 * Guarda un producto de Shopify en la base de datos
 * @param producto Producto de Shopify
 * @returns Producto guardado
 */
export async function saveProductFromShopify(producto: any) {
  try {
    logger.debug(`Guardando producto de Shopify: ${producto.title}`)

    // Extraer el ID numérico de Shopify
    const shopifyId = extractIdFromGid(producto.id)

    // Verificar si el producto ya existe en la base de datos
    const existingProduct = await db.findByField("productos", "shopify_id", shopifyId)

    // Extraer la primera variante para obtener precio e inventario
    const firstVariant = producto.variants?.edges?.[0]?.node || {}

    // Extraer la imagen destacada
    const featuredImage = producto.featuredImage?.url || producto.images?.edges?.[0]?.node?.url || null

    // Preparar los datos del producto
    const productData = {
      shopify_id: shopifyId,
      titulo: producto.title,
      descripcion: producto.description || null,
      tipo_producto: producto.productType || null,
      proveedor: producto.vendor || null,
      estado: producto.status?.toLowerCase() || "active",
      imagen_url: featuredImage,
      handle: producto.handle || null,
      precio: firstVariant.price || 0,
      precio_comparacion: firstVariant.compareAtPrice || null,
      inventario: firstVariant.inventoryQuantity || 0,
      sku: firstVariant.sku || null,
      fecha_actualizacion: new Date(),
      metadatos: JSON.stringify({
        tags: producto.tags || [],
        images: producto.images?.edges?.map((edge: any) => edge.node) || [],
        variants: producto.variants?.edges?.map((edge: any) => edge.node) || [],
        metafields: producto.metafields?.edges?.map((edge: any) => edge.node) || [],
      }),
    }

    // Si el producto ya existe, actualizarlo
    if (existingProduct) {
      logger.debug(`Actualizando producto existente: ${existingProduct.id}`)
      const updatedProduct = await db.update("productos", existingProduct.id, productData)

      // Registrar el evento de sincronización
      await db.logSyncEvent("productos", shopifyId, "actualizar", "exito", `Producto actualizado: ${producto.title}`, {
        id: updatedProduct.id,
      })

      return updatedProduct
    }

    // Si el producto no existe, crearlo
    logger.debug(`Creando nuevo producto: ${producto.title}`)
    const newProduct = await db.insert("productos", {
      ...productData,
      fecha_creacion: new Date(),
    })

    // Registrar el evento de sincronización
    await db.logSyncEvent("productos", shopifyId, "crear", "exito", `Producto creado: ${producto.title}`, {
      id: newProduct.id,
    })

    return newProduct
  } catch (error) {
    logger.error(`Error al guardar producto de Shopify: ${producto.title}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
      producto: producto.id,
    })

    // Registrar el evento de sincronización
    await db.logSyncEvent(
      "productos",
      extractIdFromGid(producto.id),
      "guardar",
      "error",
      `Error al guardar producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
      { producto: producto.title },
    )

    throw error
  }
}

/**
 * Obtiene todos los productos de la base de datos
 * @returns Array de productos
 */
export async function getAllProducts() {
  try {
    return await db.findAll("productos")
  } catch (error) {
    logger.error("Error al obtener todos los productos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Obtiene un producto por ID
 * @param id ID del producto
 * @returns Producto
 */
export async function getProductById(id: number) {
  try {
    return await db.findById("productos", id)
  } catch (error) {
    logger.error(`Error al obtener producto con ID ${id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Obtiene un producto por ID de Shopify
 * @param shopifyId ID de Shopify
 * @returns Producto
 */
export async function getProductByShopifyId(shopifyId: string) {
  try {
    return await db.findByField("productos", "shopify_id", shopifyId)
  } catch (error) {
    logger.error(`Error al obtener producto con Shopify ID ${shopifyId}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Actualiza un producto
 * @param id ID del producto
 * @param data Datos del producto
 * @returns Producto actualizado
 */
export async function updateProduct(id: number, data: any) {
  try {
    return await db.update("productos", id, {
      ...data,
      fecha_actualizacion: new Date(),
    })
  } catch (error) {
    logger.error(`Error al actualizar producto con ID ${id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Elimina un producto
 * @param id ID del producto
 * @returns Resultado de la eliminación
 */
export async function deleteProduct(id: number) {
  try {
    return await db.remove("productos", id)
  } catch (error) {
    logger.error(`Error al eliminar producto con ID ${id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}
