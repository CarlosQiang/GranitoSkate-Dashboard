import { sql } from "@vercel/postgres"
import { logError } from "./utils"

// Función para ejecutar consultas SQL
export async function query(text: string, params: any[] = []) {
  try {
    return await sql.query(text, params)
  } catch (error) {
    logError("Error en consulta SQL:", error)
    throw error
  }
}

// Funciones de utilidad para operaciones comunes
export async function findAll(table: string) {
  try {
    const result = await query(`SELECT * FROM ${table}`)
    return result.rows
  } catch (error) {
    logError(`Error al obtener todos los registros de ${table}:`, error)
    throw error
  }
}

export async function findById(table: string, id: number) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
    return result.rows[0] || null
  } catch (error) {
    logError(`Error al obtener registro con ID ${id} de ${table}:`, error)
    throw error
  }
}

export async function findByField(table: string, field: string, value: any) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value])
    return result.rows[0] || null
  } catch (error) {
    logError(`Error al obtener registro con ${field}=${value} de ${table}:`, error)
    throw error
  }
}

export async function insert(table: string, data: Record<string, any>) {
  try {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")

    const result = await query(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`, values)

    return result.rows[0]
  } catch (error) {
    logError(`Error al insertar en ${table}:`, error)
    throw error
  }
}

export async function update(table: string, id: number, data: Record<string, any>) {
  try {
    const keys = Object.keys(data)
    const values = Object.values(data)

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")

    const result = await query(
      `UPDATE ${table} SET ${setClause}, fecha_actualizacion = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id],
    )

    return result.rows[0]
  } catch (error) {
    logError(`Error al actualizar registro con ID ${id} en ${table}:`, error)
    throw error
  }
}

export async function remove(table: string, id: number) {
  try {
    await query(`DELETE FROM ${table} WHERE id = $1`, [id])
    return { success: true }
  } catch (error) {
    logError(`Error al eliminar registro con ID ${id} en ${table}:`, error)
    throw error
  }
}

export async function logSyncEvent(
  tipo_entidad: string,
  entidad_id = "UNKNOWN",
  accion: string,
  resultado: string,
  mensaje: string,
  detalles: any = {},
) {
  try {
    return insert("registro_sincronizacion", {
      tipo_entidad,
      entidad_id,
      accion,
      resultado,
      mensaje,
      detalles: JSON.stringify(detalles),
      fecha: new Date(),
    })
  } catch (error) {
    logError("Error al registrar evento de sincronización:", error)
    // No lanzamos el error para evitar interrumpir el flujo principal
    return null
  }
}

export default {
  query,
  findAll,
  findById,
  findByField,
  insert,
  update,
  remove,
  logSyncEvent,
  sql,
}
