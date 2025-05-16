import { sql } from "@vercel/postgres"
import type { RegistroSincronizacion } from "../schema"

// Registrar un evento de sincronización
export async function logSyncEvent(data: Partial<RegistroSincronizacion>): Promise<RegistroSincronizacion> {
  try {
    const { tipo_entidad, entidad_id, accion, resultado, mensaje, detalles } = data

    const result = await sql`
      INSERT INTO registro_sincronizacion (
        tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha
      )
      VALUES (
        ${tipo_entidad}, ${entidad_id || null}, ${accion}, ${resultado},
        ${mensaje || null}, ${detalles ? JSON.stringify(detalles) : null}, NOW()
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al registrar evento de sincronización:", error)
    // No lanzamos el error para evitar que falle la operación principal
    return {
      id: 0,
      tipo_entidad: data.tipo_entidad || "ERROR",
      accion: data.accion || "ERROR",
      resultado: "ERROR",
      mensaje: `Error al registrar: ${(error as Error).message}`,
      fecha: new Date(),
    }
  }
}

// Obtener registros de sincronización
export async function getRegistrosSincronizacion(
  limit = 100,
  offset = 0,
): Promise<{ registros: RegistroSincronizacion[]; total: number }> {
  try {
    const registrosResult = await sql`
      SELECT * FROM registro_sincronizacion
      ORDER BY fecha DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM registro_sincronizacion
    `

    return {
      registros: registrosResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error("Error al obtener registros de sincronización:", error)
    throw error
  }
}

// Obtener registros de sincronización por tipo de entidad
export async function getRegistrosByTipoEntidad(
  tipoEntidad: string,
  limit = 100,
  offset = 0,
): Promise<{ registros: RegistroSincronizacion[]; total: number }> {
  try {
    const registrosResult = await sql`
      SELECT * FROM registro_sincronizacion
      WHERE tipo_entidad = ${tipoEntidad}
      ORDER BY fecha DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM registro_sincronizacion
      WHERE tipo_entidad = ${tipoEntidad}
    `

    return {
      registros: registrosResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al obtener registros de sincronización para tipo ${tipoEntidad}:`, error)
    throw error
  }
}

// Obtener registros de sincronización por entidad específica
export async function getRegistrosByEntidad(
  tipoEntidad: string,
  entidadId: string,
  limit = 100,
  offset = 0,
): Promise<{ registros: RegistroSincronizacion[]; total: number }> {
  try {
    const registrosResult = await sql`
      SELECT * FROM registro_sincronizacion
      WHERE tipo_entidad = ${tipoEntidad} AND entidad_id = ${entidadId}
      ORDER BY fecha DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM registro_sincronizacion
      WHERE tipo_entidad = ${tipoEntidad} AND entidad_id = ${entidadId}
    `

    return {
      registros: registrosResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al obtener registros de sincronización para ${tipoEntidad} con ID ${entidadId}:`, error)
    throw error
  }
}

// Eliminar registros antiguos (mantener solo los últimos X días)
export async function purgeOldRegistros(diasAMantener = 30): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM registro_sincronizacion
      WHERE fecha < NOW() - INTERVAL '${diasAMantener} days'
      RETURNING id
    `
    return result.rows.length
  } catch (error) {
    console.error(`Error al purgar registros antiguos (más de ${diasAMantener} días):`, error)
    throw error
  }
}
