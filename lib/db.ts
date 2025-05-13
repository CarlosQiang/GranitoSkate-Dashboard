import { sql } from "@vercel/postgres"

// Función para ejecutar consultas SQL
export async function query(text: string, params: any[] = []) {
  const start = Date.now()
  try {
    const result = await sql.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta ejecutada", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("Error ejecutando consulta", { text, error })
    throw error
  }
}

// No hay necesidad de exportar un objeto db ya que usamos sql directamente
