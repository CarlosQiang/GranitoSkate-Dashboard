import db from "@/lib/db/vercel-postgres"

export async function getAllProductos() {
  try {
    return await db.findAll("productos")
  } catch (error) {
    console.error("Error al obtener todos los productos:", error)
    throw new Error("Error al obtener todos los productos")
  }
}

export async function getProductoById(id: number) {
  try {
    return await db.findById("productos", id)
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error)
    throw new Error(`Error al obtener producto con ID ${id}`)
  }
}

export async function getProductoByShopifyId(shopifyId: string) {
  try {
    return await db.findByShopifyId("productos", shopifyId)
  } catch (error) {
    console.error(`Error al obtener producto con Shopify ID ${shopifyId}:`, error)
    throw new Error(`Error al obtener producto con Shopify ID ${shopifyId}`)
  }
}

export async function createProducto(productoData: any) {
  try {
    // Asegurarse de que los campos estén en el formato correcto
    const producto = {
      shopify_id: productoData.shopify_id || productoData.id,
      titulo: productoData.titulo || productoData.title || "",
      descripcion: productoData.descripcion || productoData.description || "",
      tipo_producto: productoData.tipo_producto || productoData.productType || "",
      proveedor: productoData.proveedor || productoData.vendor || "",
      estado: productoData.estado || productoData.status || "active",
      imagen_url:
        productoData.imagen_url || (productoData.featuredImage ? productoData.featuredImage.url : null) || null,
      handle: productoData.handle || "",
      precio:
        productoData.precio ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.price
          : 0),
      precio_comparacion:
        productoData.precio_comparacion ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.compareAtPrice
          : null),
      inventario:
        productoData.inventario ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.inventoryQuantity
          : 0),
      sku:
        productoData.sku ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.sku
          : ""),
      fecha_creacion: productoData.fecha_creacion || productoData.createdAt || new Date(),
      fecha_actualizacion: productoData.fecha_actualizacion || productoData.updatedAt || new Date(),
      metadatos: productoData.metadatos || JSON.stringify(productoData),
    }

    return await db.insert("productos", producto)
  } catch (error) {
    console.error("Error al crear producto:", error)
    await db.logSyncEvent(
      "productos",
      productoData.shopify_id || productoData.id || "UNKNOWN",
      "crear",
      "error",
      "Error al crear producto",
      { error: error instanceof Error ? error.message : String(error), producto: productoData },
    )
    throw new Error("Error al crear producto")
  }
}

export async function updateProducto(id: number, productoData: any) {
  try {
    // Asegurarse de que los campos estén en el formato correcto
    const producto = {
      titulo: productoData.titulo || productoData.title,
      descripcion: productoData.descripcion || productoData.description,
      tipo_producto: productoData.tipo_producto || productoData.productType,
      proveedor: productoData.proveedor || productoData.vendor,
      estado: productoData.estado || productoData.status,
      imagen_url: productoData.imagen_url || (productoData.featuredImage ? productoData.featuredImage.url : null),
      handle: productoData.handle,
      precio:
        productoData.precio ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.price
          : null),
      precio_comparacion:
        productoData.precio_comparacion ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.compareAtPrice
          : null),
      inventario:
        productoData.inventario ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.inventoryQuantity
          : null),
      sku:
        productoData.sku ||
        (productoData.variants &&
        productoData.variants.edges &&
        productoData.variants.edges[0] &&
        productoData.variants.edges[0].node
          ? productoData.variants.edges[0].node.sku
          : null),
      fecha_actualizacion: new Date(),
      metadatos: productoData.metadatos || JSON.stringify(productoData),
    }

    // Eliminar campos undefined o null
    Object.keys(producto).forEach((key) => {
      if (producto[key] === undefined || producto[key] === null) {
        delete producto[key]
      }
    })

    return await db.update("productos", id, producto)
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${id}:`, error)
    await db.logSyncEvent(
      "productos",
      productoData.shopify_id || productoData.id || String(id),
      "actualizar",
      "error",
      `Error al actualizar producto con ID ${id}`,
      { error: error instanceof Error ? error.message : String(error), producto: productoData },
    )
    throw new Error(`Error al actualizar producto con ID ${id}`)
  }
}

export async function deleteProducto(id: number) {
  try {
    return await db.remove("productos", id)
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${id}:`, error)
    throw new Error(`Error al eliminar producto con ID ${id}`)
  }
}

export async function saveProductFromShopify(productoData: any) {
  try {
    // Verificar si el producto ya existe
    const shopifyId = productoData.id || productoData.shopify_id
    const productoExistente = await getProductoByShopifyId(shopifyId)

    if (productoExistente) {
      // Actualizar producto existente
      const resultado = await updateProducto(productoExistente.id, productoData)
      await db.logSyncEvent(
        "productos",
        shopifyId,
        "actualizar",
        "exito",
        `Producto actualizado: ${productoData.title || productoData.titulo}`,
        { producto: resultado },
      )
      return { ...resultado, accion: "actualizar" }
    } else {
      // Crear nuevo producto
      const resultado = await createProducto({
        ...productoData,
        shopify_id: shopifyId,
      })
      await db.logSyncEvent(
        "productos",
        shopifyId,
        "crear",
        "exito",
        `Producto creado: ${productoData.title || productoData.titulo}`,
        { producto: resultado },
      )
      return { ...resultado, accion: "crear" }
    }
  } catch (error) {
    console.error("Error al sincronizar producto:", error)
    await db.logSyncEvent(
      "productos",
      productoData.id || productoData.shopify_id || "UNKNOWN",
      "sincronizar",
      "error",
      "Error al sincronizar producto",
      { error: error instanceof Error ? error.message : String(error), producto: productoData },
    )
    throw new Error("Error al sincronizar producto")
  }
}

export async function obtenerTodosLosProductos() {
  return getAllProductos()
}

export async function obtenerProductoPorId(id: number) {
  return getProductoById(id)
}

export async function obtenerProductoPorShopifyId(shopifyId: string) {
  return getProductoByShopifyId(shopifyId)
}

export async function sincronizarProducto(productoData: any) {
  return saveProductFromShopify(productoData)
}

// Exportar todas las funciones como un objeto por defecto
export default {
  getAllProductos,
  getProductoById,
  getProductoByShopifyId,
  createProducto,
  updateProducto,
  deleteProducto,
  saveProductFromShopify,
  obtenerTodosLosProductos,
  obtenerProductoPorId,
  obtenerProductoPorShopifyId,
  sincronizarProducto,
}
