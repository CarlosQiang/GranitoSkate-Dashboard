import { sql } from "@vercel/postgres"
import type { Producto } from "../schema"

// Obtener todos los productos
export async function getAllProductos(): Promise<Producto[]> {
  try {
    const result = await sql.query(`
      SELECT * FROM productos
      ORDER BY fecha_creacion DESC
    `)
    return result.rows
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Obtener un producto por ID
export async function getProductoById(id: number): Promise<Producto | null> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM productos
      WHERE id = $1
    `,
      [id],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error)
    throw error
  }
}

// Obtener un producto por Shopify ID
export async function getProductoByShopifyId(shopifyId: string): Promise<Producto | null> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM productos
      WHERE shopify_id = $1
    `,
      [shopifyId],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener producto con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

// Crear un nuevo producto
export async function createProducto(data: Partial<Producto>): Promise<Producto> {
  try {
    const {
      shopify_id,
      titulo,
      descripcion,
      tipo_producto,
      proveedor,
      estado,
      publicado = false,
      destacado = false,
      etiquetas,
      imagen_destacada_url,
      precio_base,
      precio_comparacion,
      sku,
      codigo_barras,
      inventario_disponible,
      politica_inventario,
      requiere_envio = true,
      peso,
      unidad_peso = "kg",
      seo_titulo,
      seo_descripcion,
      url_handle,
      fecha_publicacion,
    } = data

    const result = await sql.query(
      `
      INSERT INTO productos (
        shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
        publicado, destacado, etiquetas, imagen_destacada_url, precio_base,
        precio_comparacion, sku, codigo_barras, inventario_disponible,
        politica_inventario, requiere_envio, peso, unidad_peso, seo_titulo,
        seo_descripcion, url_handle, fecha_creacion, fecha_actualizacion,
        fecha_publicacion
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, NOW(), NOW(), $23
      )
      RETURNING *
    `,
      [
        shopify_id || null,
        titulo,
        descripcion || null,
        tipo_producto || null,
        proveedor || null,
        estado || null,
        publicado,
        destacado,
        etiquetas ? JSON.stringify(etiquetas) : null,
        imagen_destacada_url || null,
        precio_base || null,
        precio_comparacion || null,
        sku || null,
        codigo_barras || null,
        inventario_disponible || null,
        politica_inventario || null,
        requiere_envio,
        peso || null,
        unidad_peso,
        seo_titulo || null,
        seo_descripcion || null,
        url_handle || null,
        fecha_publicacion || null,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}

// Actualizar un producto existente
export async function updateProducto(id: number, data: Partial<Producto>): Promise<Producto> {
  try {
    // Primero obtenemos el producto actual
    const currentProducto = await getProductoById(id)
    if (!currentProducto) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentProducto,
      ...data,
      fecha_actualizacion: new Date(),
    }

    const {
      shopify_id,
      titulo,
      descripcion,
      tipo_producto,
      proveedor,
      estado,
      publicado,
      destacado,
      etiquetas,
      imagen_destacada_url,
      precio_base,
      precio_comparacion,
      sku,
      codigo_barras,
      inventario_disponible,
      politica_inventario,
      requiere_envio,
      peso,
      unidad_peso,
      seo_titulo,
      seo_descripcion,
      url_handle,
      fecha_publicacion,
      ultima_sincronizacion,
    } = updatedData

    const result = await sql.query(
      `
      UPDATE productos
      SET
        shopify_id = $1,
        titulo = $2,
        descripcion = $3,
        tipo_producto = $4,
        proveedor = $5,
        estado = $6,
        publicado = $7,
        destacado = $8,
        etiquetas = $9,
        imagen_destacada_url = $10,
        precio_base = $11,
        precio_comparacion = $12,
        sku = $13,
        codigo_barras = $14,
        inventario_disponible = $15,
        politica_inventario = $16,
        requiere_envio = $17,
        peso = $18,
        unidad_peso = $19,
        seo_titulo = $20,
        seo_descripcion = $21,
        url_handle = $22,
        fecha_actualizacion = NOW(),
        fecha_publicacion = $23,
        ultima_sincronizacion = $24
      WHERE id = $25
      RETURNING *
    `,
      [
        shopify_id || null,
        titulo,
        descripcion || null,
        tipo_producto || null,
        proveedor || null,
        estado || null,
        publicado,
        destacado,
        etiquetas ? JSON.stringify(etiquetas) : null,
        imagen_destacada_url || null,
        precio_base || null,
        precio_comparacion || null,
        sku || null,
        codigo_barras || null,
        inventario_disponible || null,
        politica_inventario || null,
        requiere_envio,
        peso || null,
        unidad_peso,
        seo_titulo || null,
        seo_descripcion || null,
        url_handle || null,
        fecha_publicacion || null,
        ultima_sincronizacion || null,
        id,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un producto
export async function deleteProducto(id: number): Promise<boolean> {
  try {
    const result = await sql.query(
      `
      DELETE FROM productos
      WHERE id = $1
      RETURNING id
    `,
      [id],
    )

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${id}:`, error)
    throw error
  }
}

// Buscar productos
export async function searchProductos(
  query: string,
  limit = 10,
  offset = 0,
): Promise<{ productos: Producto[]; total: number }> {
  try {
    const searchQuery = `%${query}%`

    const productsResult = await sql.query(
      `
      SELECT * FROM productos
      WHERE 
        titulo ILIKE $1 OR
        descripcion ILIKE $1 OR
        tipo_producto ILIKE $1 OR
        proveedor ILIKE $1 OR
        sku ILIKE $1
      ORDER BY fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `,
      [searchQuery, limit, offset],
    )

    const countResult = await sql.query(
      `
      SELECT COUNT(*) as total FROM productos
      WHERE 
        titulo ILIKE $1 OR
        descripcion ILIKE $1 OR
        tipo_producto ILIKE $1 OR
        proveedor ILIKE $1 OR
        sku ILIKE $1
    `,
      [searchQuery],
    )

    return {
      productos: productsResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al buscar productos con query "${query}":`, error)
    throw error
  }
}

// Sincronizar un producto con Shopify
export async function syncProductoWithShopify(shopifyProducto: any): Promise<Producto> {
  try {
    // Buscar si el producto ya existe
    const existingProducto = await getProductoByShopifyId(shopifyProducto.id)

    if (existingProducto) {
      // Actualizar producto existente
      return updateProducto(existingProducto.id, {
        titulo: shopifyProducto.title,
        descripcion: shopifyProducto.body_html,
        tipo_producto: shopifyProducto.product_type,
        proveedor: shopifyProducto.vendor,
        estado: shopifyProducto.status,
        publicado: shopifyProducto.status === "active",
        etiquetas: shopifyProducto.tags ? shopifyProducto.tags.split(",").map((tag: string) => tag.trim()) : [],
        imagen_destacada_url: shopifyProducto.image?.src,
        precio_base: shopifyProducto.variants?.[0]?.price,
        precio_comparacion: shopifyProducto.variants?.[0]?.compare_at_price,
        sku: shopifyProducto.variants?.[0]?.sku,
        codigo_barras: shopifyProducto.variants?.[0]?.barcode,
        inventario_disponible: shopifyProducto.variants?.[0]?.inventory_quantity,
        politica_inventario: shopifyProducto.variants?.[0]?.inventory_policy,
        requiere_envio: shopifyProducto.variants?.[0]?.requires_shipping,
        peso: shopifyProducto.variants?.[0]?.weight,
        unidad_peso: shopifyProducto.variants?.[0]?.weight_unit,
        seo_titulo: shopifyProducto.metafields?.find((m: any) => m.key === "title")?.value,
        seo_descripcion: shopifyProducto.metafields?.find((m: any) => m.key === "description")?.value,
        url_handle: shopifyProducto.handle,
        fecha_publicacion: shopifyProducto.published_at ? new Date(shopifyProducto.published_at) : null,
        ultima_sincronizacion: new Date(),
      })
    } else {
      // Crear nuevo producto
      return createProducto({
        shopify_id: shopifyProducto.id,
        titulo: shopifyProducto.title,
        descripcion: shopifyProducto.body_html,
        tipo_producto: shopifyProducto.product_type,
        proveedor: shopifyProducto.vendor,
        estado: shopifyProducto.status,
        publicado: shopifyProducto.status === "active",
        etiquetas: shopifyProducto.tags ? shopifyProducto.tags.split(",").map((tag: string) => tag.trim()) : [],
        imagen_destacada_url: shopifyProducto.image?.src,
        precio_base: shopifyProducto.variants?.[0]?.price,
        precio_comparacion: shopifyProducto.variants?.[0]?.compare_at_price,
        sku: shopifyProducto.variants?.[0]?.sku,
        codigo_barras: shopifyProducto.variants?.[0]?.barcode,
        inventario_disponible: shopifyProducto.variants?.[0]?.inventory_quantity,
        politica_inventario: shopifyProducto.variants?.[0]?.inventory_policy,
        requiere_envio: shopifyProducto.variants?.[0]?.requires_shipping,
        peso: shopifyProducto.variants?.[0]?.weight,
        unidad_peso: shopifyProducto.variants?.[0]?.weight_unit,
        seo_titulo: shopifyProducto.metafields?.find((m: any) => m.key === "title")?.value,
        seo_descripcion: shopifyProducto.metafields?.find((m: any) => m.key === "description")?.value,
        url_handle: shopifyProducto.handle,
        fecha_publicacion: shopifyProducto.published_at ? new Date(shopifyProducto.published_at) : null,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
        ultima_sincronizacion: new Date(),
      })
    }
  } catch (error) {
    console.error(`Error al sincronizar producto con Shopify ID ${shopifyProducto.id}:`, error)
    throw error
  }
}
