import { query } from "@/lib/db"
import type { Metadato } from "@/lib/db/schema"

// Funciones para metadatos
export async function getMetadatosByPropietario(tipoPropietario: string, propietarioId: number) {
  try {
    const result = await query(
      `SELECT * FROM metadatos 
       WHERE tipo_propietario = $1 AND propietario_id = $2`,
      [tipoPropietario, propietarioId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting metadatos for ${tipoPropietario} ID ${propietarioId}:`, error)
    throw error
  }
}

export async function getMetadatoByKey(
  tipoPropietario: string,
  propietarioId: number,
  namespace: string,
  clave: string,
) {
  try {
    const result = await query(
      `SELECT * FROM metadatos 
       WHERE tipo_propietario = $1 AND propietario_id = $2 AND namespace = $3 AND clave = $4 
       LIMIT 1`,
      [tipoPropietario, propietarioId, namespace, clave],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(
      `Error getting metadato for ${tipoPropietario} ID ${propietarioId}, namespace ${namespace}, key ${clave}:`,
      error,
    )
    throw error
  }
}

export async function createMetadato(metadato: Partial<Metadato>) {
  try {
    const {
      shopify_id,
      tipo_propietario,
      propietario_id,
      shopify_propietario_id,
      namespace,
      clave,
      valor,
      tipo_valor,
    } = metadato

    // Verificar si ya existe
    const existingMetadato = await getMetadatoByKey(tipo_propietario, propietario_id, namespace, clave)

    if (existingMetadato) {
      // Actualizar el existente
      return await updateMetadato(existingMetadato.id, metadato)
    }

    const result = await query(
      `INSERT INTO metadatos (
        shopify_id, tipo_propietario, propietario_id, shopify_propietario_id,
        namespace, clave, valor, tipo_valor
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *`,
      [shopify_id, tipo_propietario, propietario_id, shopify_propietario_id, namespace, clave, valor, tipo_valor],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating metadato:", error)
    throw error
  }
}

export async function updateMetadato(id: number, metadato: Partial<Metadato>) {
  try {
    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(metadato).forEach(([key, value]) => {
      if (
        key !== "id" &&
        key !== "tipo_propietario" &&
        key !== "propietario_id" &&
        key !== "namespace" &&
        key !== "clave" &&
        value !== undefined
      ) {
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
      `UPDATE metadatos 
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
    console.error(`Error updating metadato with ID ${id}:`, error)
    throw error
  }
}

export async function deleteMetadato(id: number) {
  try {
    const result = await query(
      `DELETE FROM metadatos 
       WHERE id = $1 
       RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting metadato with ID ${id}:`, error)
    throw error
  }
}

export async function deleteMetadatosByPropietario(tipoPropietario: string, propietarioId: number) {
  try {
    const result = await query(
      `DELETE FROM metadatos 
       WHERE tipo_propietario = $1 AND propietario_id = $2 
       RETURNING id`,
      [tipoPropietario, propietarioId],
    )

    return result.rowCount > 0
  } catch (error) {
    console.error(`Error deleting metadatos for ${tipoPropietario} ID ${propietarioId}:`, error)
    throw error
  }
}
