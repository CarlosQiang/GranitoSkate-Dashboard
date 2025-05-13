import { Pool } from "pg"

// Crear una instancia de Pool para conexiones a PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Función para ejecutar consultas SQL
export async function query(text: string, params: any[] = []) {
  const start = Date.now()
  try {
    const result = await db.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta ejecutada", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("Error ejecutando consulta", { text, error })
    throw error
  }
}

// Exportar el objeto db para uso directo
export { db }
