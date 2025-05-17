import type { Pool } from "pg"
import { createPool } from "@vercel/postgres"

// Crear un pool de conexiones a la base de datos
let pool: Pool

// Inicializar el pool de conexiones
if (!pool) {
  pool = createPool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}

// Función para ejecutar consultas SQL
export async function query(text: string, params: any[] = []) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// Función para verificar la conexión a la base de datos
export async function checkConnection() {
  try {
    const result = await query("SELECT NOW()")
    return { connected: true, timestamp: result.rows[0].now }
  } catch (error) {
    console.error("Error checking database connection:", error)
    return { connected: false, error: (error as Error).message }
  }
}

// Función para obtener el pool de conexiones
export function getPool() {
  return pool
}

// Exportar el objeto db para mantener compatibilidad con el código existente
export const db = {
  query,
  checkConnection,
  getPool,
}

export default db
