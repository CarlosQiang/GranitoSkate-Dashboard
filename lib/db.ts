import { Pool } from "pg"
import { sql } from "@vercel/postgres"
import { logError } from "./utils"

// Obtener la URL de conexión de las variables de entorno
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("Error: No se ha definido la variable de entorno POSTGRES_URL o DATABASE_URL")
}

// Crear un pool de conexiones
export const pool = new Pool({
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
export async function testConnection() {
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

// Funciones de utilidad para operaciones comunes
export async function findAll(table: string) {
  const result = await sql`SELECT * FROM ${sql.identifier(table)}`
  return result.rows
}

export async function findById(table: string, id: number) {
  const result = await sql`SELECT * FROM ${sql.identifier(table)} WHERE id = ${id}`
  return result.rows[0] || null
}

export async function findByField(table: string, field: string, value: any) {
  const result = await sql`
    SELECT * FROM ${sql.identifier(table)} 
    WHERE ${sql.identifier(field)} = ${value}
  `
  return result.rows[0] || null
}

export async function insert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data)
  const values = Object.values(data)

  // Construir la consulta dinámicamente
  let query = `INSERT INTO "${table}" (`
  query += keys.map((key) => `"${key}"`).join(", ")
  query += ") VALUES ("
  query += keys.map((_, index) => `$${index + 1}`).join(", ")
  query += ") RETURNING *"

  const result = await sql.query(query, values)
  return result.rows[0]
}

export async function update(table: string, id: number, data: Record<string, any>) {
  const keys = Object.keys(data)
  const values = [...Object.values(data), id]

  // Construir la consulta dinámicamente
  let query = `UPDATE "${table}" SET `
  query += keys.map((key, index) => `"${key}" = $${index + 1}`).join(", ")
  query += ` WHERE id = $${values.length} RETURNING *`

  const result = await sql.query(query, values)
  return result.rows[0]
}

export async function remove(table: string, id: number) {
  await sql`DELETE FROM ${sql.identifier(table)} WHERE id = ${id}`
  return { success: true }
}

export async function query(text: string, params: any[] = []) {
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

export async function logSyncEvent(
  tipo_entidad: string,
  entidad_id: string | null = null,
  accion: string,
  resultado: string,
  mensaje: string,
  detalles: any = {},
) {
  return insert("registro_sincronizacion", {
    tipo_entidad,
    entidad_id,
    accion,
    resultado,
    mensaje,
    detalles: JSON.stringify(detalles),
    fecha: new Date(),
  })
}

// Función para cerrar la conexión
export async function closeConnection() {
  try {
    await pool.end()
    console.log("Conexión a la base de datos cerrada correctamente")
  } catch (error) {
    console.error("Error al cerrar la conexión a la base de datos:", error)
  }
}

// Exportar también el objeto sql para consultas personalizadas
export { sql }

// Exportar un objeto con todas las funciones para importación por defecto
const db = {
  pool,
  testConnection,
  findAll,
  findById,
  findByField,
  insert,
  update,
  remove,
  query,
  logSyncEvent,
  closeConnection,
  sql,
}

export { db }
export default db
