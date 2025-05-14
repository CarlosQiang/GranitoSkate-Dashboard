import { executeQuery, findAll, findById, insert, update, remove, logSyncEvent } from "../neon"

export async function getAllProductos() {
  return findAll("productos")
}

export async function getProductoById(id: number) {
  const productos = await findById("productos", id)
  return productos.length > 0 ? productos[0] : null
}

export async function getProductoByShopifyId(shopifyId: string) {
  const query = "SELECT * FROM productos WHERE shopify_id = $1"
  const result = await executeQuery(query, [shopifyId])
  return result.length > 0 ? result[0] : null
}

export async function createProducto(data: any) {
  try {
    const producto = await insert("productos", {
      ...data,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    })

    await logSyncEvent(
      "PRODUCT",
      producto.id.toString(),
      "CREATE",
      "SUCCESS",
      "Producto creado correctamente",
      producto,
    )

    return producto
  } catch (error) {
    await logSyncEvent(
      "PRODUCT",
      data.shopify_id || "unknown",
      "CREATE",
      "ERROR",
      `Error al crear producto: ${error.message}`,
      { error: error.message, data },
    )
    throw error
  }
}

export async function updateProducto(id: number, data: any) {
  try {
    const producto = await update("productos", id, {
      ...data,
      fecha_actualizacion: new Date(),
    })

    await logSyncEvent("PRODUCT", id.toString(), "UPDATE", "SUCCESS", "Producto actualizado correctamente", producto)

    return producto
  } catch (error) {
    await logSyncEvent("PRODUCT", id.toString(), "UPDATE", "ERROR", `Error al actualizar producto: ${error.message}`, {
      error: error.message,
      data,
    })
    throw error
  }
}

export async function deleteProducto(id: number) {
  try {
    await remove("productos", id)

    await logSyncEvent("PRODUCT", id.toString(), "DELETE", "SUCCESS", "Producto eliminado correctamente")

    return { success: true }
  } catch (error) {
    await logSyncEvent("PRODUCT", id.toString(), "DELETE", "ERROR", `Error al eliminar producto: ${error.message}`, {
      error: error.message,
    })
    throw error
  }
}

export async function syncProductoWithShopify(id: number, shopifyData: any) {
  try {
    const producto = await getProductoById(id)

    if (!producto) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    const updatedProducto = await update("productos", id, {
      shopify_id: shopifyData.id,
      ultima_sincronizacion: new Date(),
    })

    await logSyncEvent("PRODUCT", id.toString(), "SYNC", "SUCCESS", "Producto sincronizado con Shopify", {
      shopifyId: shopifyData.id,
    })

    return updatedProducto
  } catch (error) {
    await logSyncEvent("PRODUCT", id.toString(), "SYNC", "ERROR", `Error al sincronizar producto: ${error.message}`, {
      error: error.message,
    })
    throw error
  }
}
