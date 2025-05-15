import { sql } from "@vercel/postgres"

// Función para registrar eventos de sincronización
export async function logSyncEvent(data: {
  tipo_entidad: string
  entidad_id?: string
  accion: string
  resultado: string
  mensaje?: string
  detalles?: any
}) {
  try {
    const { tipo_entidad, entidad_id, accion, resultado, mensaje, detalles } = data

    const query = `
      INSERT INTO registro_sincronizacion 
      (tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `

    const values = [
      tipo_entidad,
      entidad_id || null,
      accion,
      resultado,
      mensaje || null,
      detalles ? JSON.stringify(detalles) : null,
    ]

    const result = await sql.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error("Error al registrar evento de sincronización:", error)
    // No lanzamos el error para evitar que falle la operación principal
    return null
  }
}

// Función para obtener eventos de sincronización
export async function getSyncEvents(
  limit = 100,
  offset = 0,
  filters?: {
    tipo_entidad?: string
    resultado?: string
    desde?: Date
    hasta?: Date
  },
) {
  try {
    let query = `
      SELECT * FROM registro_sincronizacion
      WHERE 1=1
    `

    const values: any[] = []
    let paramIndex = 1

    if (filters?.tipo_entidad) {
      query += ` AND tipo_entidad = $${paramIndex}`
      values.push(filters.tipo_entidad)
      paramIndex++
    }

    if (filters?.resultado) {
      query += ` AND resultado = $${paramIndex}`
      values.push(filters.resultado)
      paramIndex++
    }

    if (filters?.desde) {
      query += ` AND fecha >= $${paramIndex}`
      values.push(filters.desde)
      paramIndex++
    }

    if (filters?.hasta) {
      query += ` AND fecha <= $${paramIndex}`
      values.push(filters.hasta)
      paramIndex++
    }

    query += ` ORDER BY fecha DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    const result = await sql.query(query, values)
    return result.rows
  } catch (error) {
    console.error("Error al obtener eventos de sincronización:", error)
    throw error
  }
}

// Función para contar eventos de sincronización
export async function countSyncEvents(filters?: {
  tipo_entidad?: string
  resultado?: string
  desde?: Date
  hasta?: Date
}) {
  try {
    let query = `
      SELECT COUNT(*) as total FROM registro_sincronizacion
      WHERE 1=1
    `

    const values: any[] = []
    let paramIndex = 1

    if (filters?.tipo_entidad) {
      query += ` AND tipo_entidad = $${paramIndex}`
      values.push(filters.tipo_entidad)
      paramIndex++
    }

    if (filters?.resultado) {
      query += ` AND resultado = $${paramIndex}`
      values.push(filters.resultado)
      paramIndex++
    }

    if (filters?.desde) {
      query += ` AND fecha >= $${paramIndex}`
      values.push(filters.desde)
      paramIndex++
    }

    if (filters?.hasta) {
      query += ` AND fecha <= $${paramIndex}`
      values.push(filters.hasta)
      paramIndex++
    }

    const result = await sql.query(query, values)
    return Number.parseInt(result.rows[0].total)
  } catch (error) {
    console.error("Error al contar eventos de sincronización:", error)
    throw error
  }
}
