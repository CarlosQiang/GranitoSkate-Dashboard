import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

// Crear pool de conexiones a Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para conexiones SSL a Neon
  },
  max: 10, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo que una conexión puede estar inactiva
  connectionTimeoutMillis: 5000, // Tiempo máximo para establecer una conexión
})

// Exportar cliente de drizzle para consultas ORM
export const db = drizzle(pool)

// Función para ejecutar consultas SQL directas
export async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    return result.rows
  } finally {
    client.release()
  }
}

// Función para verificar la conexión a la base de datos
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect()
    try {
      await client.query("SELECT 1")
      console.log("✅ Conexión a Neon establecida correctamente")
      return true
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("❌ Error al conectar con Neon:", error)
    return false
  }
}

// Función para cerrar todas las conexiones
export async function closePool() {
  await pool.end()
}

export default {
  db,
  executeQuery,
  checkDatabaseConnection,
  closePool,
}
