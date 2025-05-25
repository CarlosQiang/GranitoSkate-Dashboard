import { Pool } from "pg"

// Obtener la URL de conexión de las variables de entorno
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("Error: No se ha definido la variable de entorno POSTGRES_URL o DATABASE_URL")
}

// Crear un pool de conexiones
const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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

// Función para ejecutar consultas
export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error("Error en consulta de base de datos:", error)
    throw error
  } finally {
    client.release()
  }
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

// Exportar funciones
export default {
  pool,
  testConnection,
  query,
  closeConnection,
}
