import { Pool } from "pg"

// Crear pool de conexiones
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Función para ejecutar consultas
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta ejecutada:", { text: text.substring(0, 100), duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error en consulta de base de datos:", error)
    throw error
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await query("SELECT NOW() as current_time")
    return {
      success: true,
      message: "Conexión exitosa a la base de datos",
      timestamp: result.rows[0].current_time,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Función para obtener información de la base de datos
export async function getDatabaseInfo() {
  try {
    const versionResult = await query("SELECT version()")
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    return {
      success: true,
      version: versionResult.rows[0].version,
      tables: tablesResult.rows.map((row) => row.table_name),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export default pool
