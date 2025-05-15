import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"
import { Logger } from "next-axiom"

// Configuración para entornos serverless
neonConfig.fetchConnectionCache = true

// Crear un logger para registrar eventos de la base de datos
const logger = new Logger({
  source: "neon-client",
})

// URL de conexión a la base de datos Neon
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  logger.error("DATABASE_URL no está definida en las variables de entorno")
  throw new Error("DATABASE_URL no está definida en las variables de entorno")
}

// Crear un cliente SQL para consultas directas
export const sql = neon(databaseUrl)

// Crear un pool de conexiones para consultas más complejas
let _pool: Pool | null = null

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: databaseUrl })
    logger.info("Pool de conexiones a Neon inicializado")
  }
  return _pool
}

// Función para ejecutar consultas con manejo de errores
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  try {
    const result = await sql(query, params)
    return result
  } catch (error) {
    logger.error("Error al ejecutar consulta SQL", { error: (error as Error).message, query })
    throw error
  }
}

// Función para verificar la conexión a la base de datos
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as test`
    return result && result.length > 0 && result[0].test === 1
  } catch (error) {
    logger.error("Error al verificar conexión a Neon", { error: (error as Error).message })
    return false
  }
}

// Función para cerrar la conexión (útil para tests y desarrollo)
export async function closeConnection(): Promise<void> {
  if (_pool) {
    await _pool.end()
    _pool = null
    logger.info("Conexión a Neon cerrada")
  }
}
