import { Pool } from "pg"

// Configuración de la conexión a la base de datos
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  console.error("Error: No se ha definido la variable de entorno POSTGRES_URL o DATABASE_URL")
}

// Crear un pool de conexiones
export const db = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo que una conexión puede estar inactiva antes de ser cerrada
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer una conexión
})

// Manejar errores de conexión
db.on("error", (err) => {
  console.error("Error inesperado en el cliente de PostgreSQL:", err)
})

/**
 * Ejecuta una consulta SQL
 * @param text Consulta SQL
 * @param params Parámetros de la consulta
 * @returns Resultado de la consulta
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await db.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta ejecutada:", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error en consulta:", error)
    throw error
  }
}

// Verificar la conexión
export async function testConnection() {
  if (!connectionString) {
    console.error("No hay URL de conexión definida")
    return false
  }

  try {
    const client = await db.connect()
    console.log("Conexión a la base de datos establecida correctamente")
    client.release()
    return true
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
    return false
  }
}

/**
 * Verifica la conexión a la base de datos
 * @returns Estado de la conexión
 */
export async function checkConnection() {
  try {
    const client = await db.connect()
    client.release()
    return { connected: true, message: "Conexión exitosa a la base de datos" }
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error)
    return {
      connected: false,
      message: "Error al conectar a la base de datos",
      error: (error as Error).message,
    }
  }
}

// Función para cerrar la conexión
export async function closeConnection() {
  try {
    await db.end()
    console.log("Conexión a la base de datos cerrada correctamente")
  } catch (error) {
    console.error("Error al cerrar la conexión a la base de datos:", error)
  }
}

// Funciones CRUD genéricas
export async function findAll(table: string) {
  try {
    const result = await query(`SELECT * FROM ${table}`)
    return result.rows
  } catch (error) {
    console.error(`Error al obtener todos los registros de ${table}:`, error)
    throw error
  }
}

export async function findById(table: string, id: number) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener registro por ID de ${table}:`, error)
    throw error
  }
}

export async function findByField(table: string, field: string, value: any) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener registro por ${field} de ${table}:`, error)
    throw error
  }
}

export async function insert(table: string, data: any) {
  try {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ")
    const columns = keys.join(", ")

    const result = await query(`INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`, values)
    return result.rows[0]
  } catch (error) {
    console.error(`Error al insertar en ${table}:`, error)
    throw error
  }
}

export async function update(table: string, id: number, data: any) {
  try {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ")

    const result = await query(`UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`, [
      ...values,
      id,
    ])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al actualizar en ${table}:`, error)
    throw error
  }
}

export async function remove(table: string, id: number) {
  try {
    const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al eliminar de ${table}:`, error)
    throw error
  }
}

// Función logSyncEvent para registrar eventos de sincronización
export async function logSyncEvent(
  tipo: string,
  entidad_id: string | null,
  accion: string,
  estado: string,
  mensaje: string,
  datos_adicionales?: any,
) {
  try {
    const result = await query(
      `INSERT INTO registro_sincronizacion 
       (tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [tipo, entidad_id, accion, estado, mensaje, JSON.stringify(datos_adicionales || {})],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error al registrar evento de sincronización:", error)
    // No lanzar error para evitar que falle la operación principal
    return null
  }
}

// Export por defecto para compatibilidad
const database = {
  db,
  testConnection,
  query,
  closeConnection,
  findAll,
  findById,
  findByField,
  insert,
  update,
  remove,
  logSyncEvent,
}

export default database
