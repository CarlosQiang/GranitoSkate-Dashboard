import { Pool, type QueryResult } from "pg"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "db",
})

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Función para ejecutar consultas SQL
export async function query(text: string, params: any[] = []): Promise<QueryResult> {
  try {
    return await pool.query(text, params)
  } catch (error) {
    logger.error("Error al ejecutar consulta SQL:", error)
    throw error
  }
}

// Función para verificar la conexión a la base de datos
export async function checkConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const result = await query("SELECT NOW()")
    return { connected: true }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Funciones genéricas para operaciones CRUD
export async function findAll(table: string, limit = 100, offset = 0): Promise<any[]> {
  const result = await query(`SELECT * FROM ${table} ORDER BY id DESC LIMIT $1 OFFSET $2`, [limit, offset])
  return result.rows
}

export async function findById(table: string, id: number): Promise<any> {
  const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
  return result.rows[0]
}

export async function findByField(table: string, field: string, value: any): Promise<any> {
  const result = await query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value])
  return result.rows[0]
}

export async function insert(table: string, data: any): Promise<any> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")
  const columns = keys.join(", ")

  const result = await query(`INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`, values)

  return result.rows[0]
}

export async function update(table: string, id: number, data: any): Promise<any> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")

  const result = await query(`UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`, [
    ...values,
    id,
  ])

  return result.rows[0]
}

export async function remove(table: string, id: number): Promise<boolean> {
  const result = await query(`DELETE FROM ${table} WHERE id = $1`, [id])
  return result.rowCount > 0
}

// Función para registrar eventos de sincronización
export async function logSyncEvent(data: {
  tipo_entidad: string
  entidad_id?: string
  accion: string
  resultado: string
  mensaje: string
  detalles?: any
}): Promise<void> {
  try {
    await query(
      `INSERT INTO registro_sincronizacion (
        tipo, cantidad, detalles, fecha
      ) VALUES ($1, $2, $3, $4)`,
      [
        data.tipo_entidad,
        1,
        data.detalles
          ? JSON.stringify({
              entidad_id: data.entidad_id,
              accion: data.accion,
              resultado: data.resultado,
              mensaje: data.mensaje,
              ...data.detalles,
            })
          : null,
        new Date(),
      ],
    )
  } catch (error) {
    logger.error("Error al registrar evento de sincronización:", error)
  }
}

// Exportar el objeto db para mantener compatibilidad con el código existente
export const db = {
  query,
  checkConnection,
  findAll,
  findById,
  findByField,
  insert,
  update,
  remove,
  logSyncEvent,
}

export default db
