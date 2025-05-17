import { query } from "@/lib/db"

export interface SyncEvent {
  tipo_entidad: string
  entidad_id?: string
  accion: string
  resultado: string
  mensaje?: string
  detalles?: any
}

export async function logSyncEvent(event: SyncEvent) {
  try {
    const { tipo_entidad, entidad_id, accion, resultado, mensaje, detalles } = event

    const result = await query(
      `INSERT INTO registro_sincronizacion 
       (tipo_entidad, entidad_id, accion, resultado, mensaje, detalles) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [tipo_entidad, entidad_id, accion, resultado, mensaje, detalles ? JSON.stringify(detalles) : null],
    )

    return result.rows[0].id
  } catch (error) {
    console.error("Error logging sync event:", error)
    // No lanzar error para evitar interrumpir el flujo principal
    return null
  }
}

export async function getRecentSyncEvents(limit = 50) {
  try {
    const result = await query(
      `SELECT * FROM registro_sincronizacion 
       ORDER BY fecha DESC 
       LIMIT $1`,
      [limit],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting recent sync events:", error)
    return []
  }
}

export async function getSyncEventsByType(tipo: string, limit = 50) {
  try {
    const result = await query(
      `SELECT * FROM registro_sincronizacion 
       WHERE tipo_entidad = $1
       ORDER BY fecha DESC 
       LIMIT $2`,
      [tipo, limit],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting sync events for type ${tipo}:`, error)
    return []
  }
}

export async function getSyncEventsByEntity(tipo: string, entidadId: string, limit = 50) {
  try {
    const result = await query(
      `SELECT * FROM registro_sincronizacion 
       WHERE tipo_entidad = $1 AND entidad_id = $2
       ORDER BY fecha DESC 
       LIMIT $3`,
      [tipo, entidadId, limit],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting sync events for entity ${tipo}/${entidadId}:`, error)
    return []
  }
}
