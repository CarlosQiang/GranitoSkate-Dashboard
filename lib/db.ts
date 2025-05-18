import { sql } from "@vercel/postgres"

// Función para ejecutar consultas SQL
export async function query(text: string, params: any[] = []) {
  try {
    return await sql.query(text, params)
  } catch (error) {
    console.error("Error en consulta SQL:", error)
    throw error
  }
}

// Función para verificar la conexión a la base de datos
export async function checkConnection() {
  try {
    await sql`SELECT 1`
    return { connected: true }
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
    return { connected: false, error: error.message }
  }
}

export default {
  query,
  sql,
}
