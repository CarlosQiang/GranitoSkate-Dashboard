"use server"

import { query } from "@/lib/db"
import type { Producto, VarianteProducto, ImagenProducto } from "@/lib/db/schema"

// Funciones para productos
export async function getAllProductos() {
  try {
    const result = await query(
      `SELECT * FROM productos 
       ORDER BY fecha_creacion DESC`,
    )

    return result.rows
  } catch (error) {
    console.error("Error getting all productos:", error)
    throw error
  }
}

export async function getProductoById(id: number) {
  try {
    const result = await query(
      `SELECT * FROM productos 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting producto with ID ${id}:`, error)
    throw error
  }
}

export async function getProductoByShopifyId(shopifyId: string) {
  try {
    const result = await query(
      `SELECT * FROM productos 
       WHERE shopify_id = $1`,
      [shopifyId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting producto with Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

export async function createProducto(producto: Partial<Producto>) {
  try {
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
      url_handle,
      fecha_publicacion,
    } = producto

    const result = await query(
      `INSERT INTO productos (
        shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
        publicado, destacado, etiquetas, imagen_destacada_url, precio_base,
        precio_comparacion, sku, codigo_barras, inventario_disponible,
        politica_inventario, requiere_envio, peso, unidad_peso, url_handle, fecha_publicacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *`,
      [
        shopify_id,
        titulo,
        descripcion,
        tipo_producto,
        proveedor,
        estado,
        publicado !== undefined ? publicado : false,
        destacado !== undefined ? destacado : false,
        etiquetas,
        imagen_destacada_url,
        precio_base,
        precio_comparacion,
        sku,
        codigo_barras,
        inventario_disponible,
        politica_inventario,
        requiere_envio !== undefined ? requiere_envio : true,
        peso,
        unidad_peso,
        url_handle,
        fecha_publicacion,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating producto:", error)
    throw error
  }
}

export async function updateProducto(id: number, producto: Partial<Producto>) {
  try {
    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(producto).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    // Añadir fecha de actualización
    updates.push(`fecha_actualizacion = NOW()`)

    // Añadir el ID al final de los valores
    values.push(id)

    const result = await query(
      `UPDATE productos 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values,
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error updating producto with ID ${id}:`, error)
    throw error
  }
}

export async function deleteProducto(id: number) {
  try {
    const result = await query(
      `DELETE FROM productos 
       WHERE id = $1 
       RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting producto with ID ${id}:`, error)
    throw error
  }
}

// Funciones para variantes de producto
export async function getVariantesByProductoId(productoId: number) {
  try {
    const result = await query(
      `SELECT * FROM variantes_producto 
       WHERE producto_id = $1 
       ORDER BY posicion`,
      [productoId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting variantes for producto ID ${productoId}:`, error)
    throw error
  }
}

export async function createVariante(variante: Partial<VarianteProducto>) {
  try {
    const {
      shopify_id,
      producto_id,
      titulo,
      precio,
      precio_comparacion,
      sku,
      codigo_barras,
      inventario_disponible,
      politica_inventario,
      requiere_envio,
      peso,
      unidad_peso,
      opcion1_nombre,
      opcion1_valor,
      opcion2_nombre,
      opcion2_valor,
      opcion3_nombre,
      opcion3_valor,
      posicion,
    } = variante

    const result = await query(
      `INSERT INTO variantes_producto (
        shopify_id, producto_id, titulo, precio, precio_comparacion,
        sku, codigo_barras, inventario_disponible, politica_inventario,
        requiere_envio, peso, unidad_peso, opcion1_nombre, opcion1_valor,
        opcion2_nombre, opcion2_valor, opcion3_nombre, opcion3_valor, posicion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *`,
      [
        shopify_id,
        producto_id,
        titulo,
        precio,
        precio_comparacion,
        sku,
        codigo_barras,
        inventario_disponible,
        politica_inventario,
        requiere_envio !== undefined ? requiere_envio : true,
        peso,
        unidad_peso,
        opcion1_nombre,
        opcion1_valor,
        opcion2_nombre,
        opcion2_valor,
        opcion3_nombre,
        opcion3_valor,
        posicion,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating variante:", error)
    throw error
  }
}

// Funciones para imágenes de producto
export async function getImagenesByProductoId(productoId: number) {
  try {
    const result = await query(
      `SELECT * FROM imagenes_producto 
       WHERE producto_id = $1 
       ORDER BY posicion`,
      [productoId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting imagenes for producto ID ${productoId}:`, error)
    throw error
  }
}

export async function createImagen(imagen: Partial<ImagenProducto>) {
  try {
    const { shopify_id, producto_id, variante_id, url, texto_alternativo, posicion, es_destacada } = imagen

    const result = await query(
      `INSERT INTO imagenes_producto (
        shopify_id, producto_id, variante_id, url, texto_alternativo,
        posicion, es_destacada
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *`,
      [
        shopify_id,
        producto_id,
        variante_id,
        url,
        texto_alternativo,
        posicion,
        es_destacada !== undefined ? es_destacada : false,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating imagen:", error)
    throw error
  }
}
