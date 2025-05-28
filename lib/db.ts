import { Pool } from "pg"
import { logError } from "./utils"

// Obtener la URL de conexión de las variables de entorno
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("Error: No se ha definido la variable de entorno POSTGRES_URL o DATABASE_URL")
}

// Crear un pool de conexiones
const pool = new Pool({
  connectionString: connectionString || "",
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo que una conexión puede estar inactiva antes de ser cerrada
  connectionTimeoutMillis: 5000, // Tiempo máximo para establecer una conexión
})

// Manejar errores de conexión
pool.on("error", (err) => {
  console.error("Error inesperado en el cliente de PostgreSQL:", err)
})

// Verificar la conexión
async function testConnection() {
  if (!connectionString) {
    console.error("No hay URL de conexión definida")
    return false
  }

  try {
    const client = await pool.connect()
    console.log("Conexión a la base de datos establecida correctamente")
    client.release()
    return true
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
    return false
  }
}

// Función para ejecutar consultas
async function query(text: string, params: any[] = []) {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta ejecutada", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    logError("Error ejecutando consulta", error)
    throw error
  }
}

// Función para cerrar la conexión
async function closeConnection() {
  try {
    await pool.end()
    console.log("Conexión a la base de datos cerrada correctamente")
  } catch (error) {
    console.error("Error al cerrar la conexión a la base de datos:", error)
  }
}

// Funciones CRUD genéricas
async function findAll(table: string) {
  try {
    const result = await query(`SELECT * FROM ${table}`)
    return result.rows
  } catch (error) {
    console.error(`Error al obtener todos los registros de ${table}:`, error)
    throw error
  }
}

async function findById(table: string, id: number) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener registro por ID de ${table}:`, error)
    throw error
  }
}

async function findByField(table: string, field: string, value: any) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener registro por ${field} de ${table}:`, error)
    throw error
  }
}

async function insert(table: string, data: any) {
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

async function update(table: string, id: number, data: any) {
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

async function remove(table: string, id: number) {
  try {
    const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al eliminar de ${table}:`, error)
    throw error
  }
}

// Función logSyncEvent para registrar eventos de sincronización
async function logSyncEvent(
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

// Exportar todas las funciones y objetos individualmente
export {
  pool,
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

// Export por defecto para compatibilidad con código existente
const db = {
  pool,
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

export default db
