import { query } from "@/lib/db"
import type { Promocion } from "@/lib/db/schema"

// Funciones para promociones
export async function getAllPromociones() {
  try {
    const result = await query(
      `SELECT * FROM promociones 
       ORDER BY fecha_creacion DESC`,
    )

    return result.rows
  } catch (error) {
    console.error("Error getting all promociones:", error)
    throw error
  }
}

export async function getPromocionById(id: number) {
  try {
    const result = await query(
      `SELECT * FROM promociones 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting promocion with ID ${id}:`, error)
    throw error
  }
}

export async function getPromocionByShopifyId(shopifyId: string) {
  try {
    const result = await query(
      `SELECT * FROM promociones 
       WHERE shopify_id = $1`,
      [shopifyId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting promocion with Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

export async function getPromocionByCodigo(codigo: string) {
  try {
    const result = await query(
      `SELECT * FROM promociones 
       WHERE codigo = $1`,
      [codigo],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting promocion with codigo ${codigo}:`, error)
    throw error
  }
}

export async function createPromocion(promocion: Partial<Promocion>) {
  try {
    const {
      shopify_id,
      titulo,
      descripcion,
      tipo,
      valor,
      codigo,
      objetivo,
      objetivo_id,
      condiciones,
      fecha_inicio,
      fecha_fin,
      activa,
      limite_uso,
      contador_uso,
      es_automatica,
    } = promocion

    const result = await query(
      `INSERT INTO promociones (
        shopify_id, titulo, descripcion, tipo, valor, codigo,
        objetivo, objetivo_id, condiciones, fecha_inicio, fecha_fin,
        activa, limite_uso, contador_uso, es_automatica
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *`,
      [
        shopify_id,
        titulo,
        descripcion,
        tipo,
        valor,
        codigo,
        objetivo,
        objetivo_id,
        condiciones ? JSON.stringify(condiciones) : null,
        fecha_inicio,
        fecha_fin,
        activa !== undefined ? activa : false,
        limite_uso,
        contador_uso || 0,
        es_automatica !== undefined ? es_automatica : false,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating promocion:", error)
    throw error
  }
}

export async function updatePromocion(id: number, promocion: Partial<Promocion>) {
  try {
    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(promocion).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        // Manejar el caso especial de condiciones
        if (key === "condiciones" && value) {
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
      `UPDATE promociones 
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
    console.error(`Error updating promocion with ID ${id}:`, error)
    throw error
  }
}

export async function deletePromocion(id: number) {
  try {
    const result = await query(
      `DELETE FROM promociones 
       WHERE id = $1 
       RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting promocion with ID ${id}:`, error)
    throw error
  }
}

export async function incrementarContadorUso(id: number) {
  try {
    const result = await query(
      `UPDATE promociones 
       SET contador_uso = contador_uso + 1, 
           fecha_actualizacion = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error incrementing contador_uso for promocion with ID ${id}:`, error)
    throw error
  }
}

export async function getPromocionesActivas() {
  try {
    const now = new Date()

    const result = await query(
      `SELECT * FROM promociones 
       WHERE activa = true 
       AND (fecha_inicio IS NULL OR fecha_inicio <= $1) 
       AND (fecha_fin IS NULL OR fecha_fin >= $1) 
       ORDER BY fecha_creacion DESC`,
      [now],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting active promociones:", error)
    throw error
  }
}
