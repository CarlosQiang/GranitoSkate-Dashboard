import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Verificar que la variable de entorno esté definida
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está definida en las variables de entorno")
}

// Crear el cliente de Neon
const sql = neon(process.env.DATABASE_URL!)

// Crear la instancia de Drizzle con el esquema completo
export const db = drizzle(sql, { schema })

// Función para verificar la conexión a la base de datos
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as check`
    return { connected: result && result.length > 0 && result[0].check === 1 }
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
