import { Pool } from "pg"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

// Cargar variables de entorno
dotenv.config()

// Obtener la URL de conexión de las variables de entorno
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("Error: No se ha definido la variable de entorno POSTGRES_URL o DATABASE_URL")
  process.exit(1)
}

// Crear un pool de conexiones
const pool = new Pool({
  connectionString,
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
async function testConnection() {
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

// Exportar el pool para su uso en la aplicación
export { pool, testConnection }

// Crear y exportar una instancia de PrismaClient
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
})

export default prisma
