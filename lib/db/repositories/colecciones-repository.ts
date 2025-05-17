import { query } from "@/lib/db"
import type { Coleccion } from "@/lib/db/schema"

// Funciones para colecciones
export async function getAllColecciones() {
  try {
    const result = await query(
      `SELECT * FROM colecciones 
       ORDER BY fecha_creacion DESC`,
    )

    return result.rows
  } catch (error) {
    console.error("Error getting all colecciones:", error)
    throw error
  }
}

export async function getColeccionById(id: number) {
  try {
    const result = await query(
      `SELECT * FROM colecciones 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting coleccion with ID ${id}:`, error)
    throw error
  }
}

export async function getColeccionByShopifyId(shopifyId: string) {
  try {
    const result = await query(
      `SELECT * FROM colecciones 
       WHERE shopify_id = $1`,
      [shopifyId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting coleccion with Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

export async function createColeccion(coleccion: Partial<Coleccion>) {
  try {
    const {
      shopify_id,
      titulo,
      descripcion,
      url_handle,
      imagen_url,
      es_automatica,
      condiciones_automaticas,
      publicada,
      seo_titulo,
      seo_descripcion,
      fecha_publicacion,
    } = coleccion

    const result = await query(
      `INSERT INTO colecciones (
        shopify_id, titulo, descripcion, url_handle, imagen_url,
        es_automatica, condiciones_automaticas, publicada,
        seo_titulo, seo_descripcion, fecha_publicacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *`,
      [
        shopify_id,
        titulo,
        descripcion,
        url_handle,
        imagen_url,
        es_automatica !== undefined ? es_automatica : false,
        condiciones_automaticas ? JSON.stringify(condiciones_automaticas) : null,
        publicada !== undefined ? publicada : false,
        seo_titulo,
        seo_descripcion,
        fecha_publicacion,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating coleccion:", error)
    throw error
  }
}

export async function updateColeccion(id: number, coleccion: Partial<Coleccion>) {
  try {
    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(coleccion).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        // Manejar el caso especial de condiciones_automaticas
        if (key === "condiciones_automaticas" && value) {
          updates.push(`${key} = $${paramIndex}`)
          values.push(JSON.stringify(value))
        } else {
          updates.push(`${key} = $${paramIndex}`)
          values.push(value)
        }
        paramIndex++
      }
    })

    // Añadir fecha de actualización
    updates.push(`fecha_actualizacion = NOW()`)

    // Añadir el ID al final de los valores
    values.push(id)

    const result = await query(
      `UPDATE colecciones 
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
    console.error(`Error updating coleccion with ID ${id}:`, error)
    throw error
  }
}

export async function deleteColeccion(id: number) {
  try {
    const result = await query(
      `DELETE FROM colecciones 
       WHERE id = $1 
       RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting coleccion with ID ${id}:`, error)
    throw error
  }
}

// Funciones para la relación productos-colecciones
export async function getProductosByColeccionId(coleccionId: number) {
  try {
    const result = await query(
      `SELECT p.* 
       FROM productos p
       JOIN productos_colecciones pc ON p.id = pc.producto_id
       WHERE pc.coleccion_id = $1
       ORDER BY pc.posicion, p.titulo`,
      [coleccionId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting productos for coleccion ID ${coleccionId}:`, error)
    throw error
  }
}

export async function getColeccionesByProductoId(productoId: number) {
  try {
    const result = await query(
      `SELECT c.* 
       FROM colecciones c
       JOIN productos_colecciones pc ON c.id = pc.coleccion_id
       WHERE pc.producto_id = $1
       ORDER BY c.titulo`,
      [productoId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting colecciones for producto ID ${productoId}:`, error)
    throw error
  }
}

export async function addProductoToColeccion(productoId: number, coleccionId: number, posicion?: number) {
  try {
    // Verificar si ya existe la relación
    const checkResult = await query(
      `SELECT * FROM productos_colecciones 
       WHERE producto_id = $1 AND coleccion_id = $2`,
      [productoId, coleccionId],
    )

    if (checkResult.rows.length > 0) {
      // Si ya existe, actualizar la posición si se proporciona
      if (posicion !== undefined) {
        const updateResult = await query(
          `UPDATE productos_colecciones 
           SET posicion = $1, fecha_actualizacion = NOW()
           WHERE producto_id = $2 AND coleccion_id = $3
           RETURNING *`,
          [posicion, productoId, coleccionId],
        )

        return updateResult.rows[0]
      }

      return checkResult.rows[0]
    }

    // Si no existe, crear la relación
    const result = await query(
      `INSERT INTO productos_colecciones (
        producto_id, coleccion_id, posicion
      ) VALUES (
        $1, $2, $3
      ) RETURNING *`,
      [productoId, coleccionId, posicion],
    )

    return result.rows[0]
  } catch (error) {
    console.error(`Error adding producto ${productoId} to coleccion ${coleccionId}:`, error)
    throw error
  }
}

export async function removeProductoFromColeccion(productoId: number, coleccionId: number) {
  try {
    const result = await query(
      `DELETE FROM productos_colecciones 
       WHERE producto_id = $1 AND coleccion_id = $2
       RETURNING *`,
      [productoId, coleccionId],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error removing producto ${productoId} from coleccion ${coleccionId}:`, error)
    throw error
  }
}
