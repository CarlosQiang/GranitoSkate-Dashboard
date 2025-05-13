import { Pool } from "@neondatabase/serverless"

// Crear un pool de conexiones a la base de datos
let pool: Pool | null = null

// Inicializar el pool de conexiones de forma perezosa
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }
  return pool
}

/**
 * Ejecuta una consulta SQL en la base de datos
 * @param text Consulta SQL
 * @param params Parámetros para la consulta
 * @returns Resultado de la consulta
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const client = await getPool().connect()
    try {
      const result = await client.query(text, params)
      const duration = Date.now() - start
      console.log("Consulta ejecutada", { text, duration, rows: result.rowCount })
      return result
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error al ejecutar consulta", { text, error })
    throw error
  }
}

/**
 * Verifica la conexión a la base de datos
 * @returns Estado de la conexión
 */
export async function checkConnection() {
  try {
    const result = await query("SELECT NOW()")
    return {
      success: true,
      timestamp: result.rows[0].now,
    }
  } catch (error) {
    console.error("Error al verificar conexión a la base de datos", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

/**
 * Inicializa la base de datos si es necesario
 */
export async function initializeDatabase() {
  try {
    // Verificar si la tabla administradores existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      );
    `)

    // Si la tabla no existe, crearla
    if (!tableExists.rows[0].exists) {
      console.log("Creando tabla administradores...")
      await query(`
        CREATE TABLE administradores (
          id SERIAL PRIMARY KEY,
          nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
          correo_electronico VARCHAR(100) UNIQUE NOT NULL,
          contrasena VARCHAR(255) NOT NULL,
          nombre_completo VARCHAR(100),
          rol VARCHAR(20) NOT NULL DEFAULT 'admin',
          activo BOOLEAN NOT NULL DEFAULT true,
          ultimo_acceso TIMESTAMP,
          fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_administradores_correo ON administradores(correo_electronico);
        CREATE INDEX idx_administradores_usuario ON administradores(nombre_usuario);
      `)

      // Importar bcryptjs dinámicamente para entornos serverless
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash("Granitoskate", 12)

      await query(
        `
        INSERT INTO administradores (nombre_usuario, correo_electronico, contrasena, nombre_completo, rol)
        VALUES ($1, $2, $3, $4, $5)
      `,
        ["admin", "administrador@gmail.com", hashedPassword, "Administrador Principal", "superadmin"],
      )

      console.log("Tabla administradores creada e inicializada correctamente")
    }

    return { success: true }
  } catch (error) {
    console.error("Error al inicializar la base de datos", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
