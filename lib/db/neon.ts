import { Pool } from "pg"
import { neon } from "@neondatabase/serverless"

// Configuración para conexión directa a Neon
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

// Cliente Neon para operaciones serverless
export const sql = neon(connectionString)

// Pool de conexiones para operaciones tradicionales
export const pool = new Pool({
  connectionString,
  ssl: true,
})

// Función para ejecutar consultas SQL con el pool
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// Función para verificar la conexión
export async function checkConnection() {
  try {
    const result = await sql`SELECT NOW()`
    return { connected: true, timestamp: result[0].now }
  } catch (error) {
    console.error("Database connection error:", error)
    return { connected: false, error: error.message }
  }
}

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    // Crear tabla de administradores si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS administradores (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
        correo_electronico VARCHAR(100) UNIQUE NOT NULL,
        contrasena TEXT NOT NULL,
        nombre_completo VARCHAR(100),
        rol VARCHAR(20) NOT NULL DEFAULT 'admin',
        activo BOOLEAN NOT NULL DEFAULT true,
        ultimo_acceso TIMESTAMP,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP
      )
    `

    // Verificar si existe el usuario admin
    const adminCheck = await sql`
      SELECT id FROM administradores WHERE nombre_usuario = 'admin'
    `

    // Si no existe, crear el usuario admin con la contraseña GranitoSkate
    if (adminCheck.length === 0) {
      // Contraseña hasheada para 'GranitoSkate'
      const hashedPassword = "$2b$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy"

      await sql`
        INSERT INTO administradores (
          nombre_usuario, 
          correo_electronico, 
          contrasena, 
          nombre_completo, 
          rol, 
          activo
        ) VALUES (
          'admin', 
          'admin@granitoskate.com', 
          ${hashedPassword}, 
          'Administrador', 
          'superadmin', 
          true
        )
      `

      return { initialized: true, adminCreated: true }
    }

    return { initialized: true, adminCreated: false }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { initialized: false, error: error.message }
  }
}
