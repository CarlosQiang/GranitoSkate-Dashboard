import { Pool } from "pg"

// Crear pool de conexiones
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Función para ejecutar consultas
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta ejecutada:", { text: text.substring(0, 100), duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error en consulta de base de datos:", error)
    throw error
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await query("SELECT NOW() as current_time")
    return {
      success: true,
      message: "Conexión exitosa a la base de datos",
      timestamp: result.rows[0].current_time,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Función para obtener información de la base de datos
export async function getDatabaseInfo() {
  try {
    const versionResult = await query("SELECT version()")
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    return {
      success: true,
      version: versionResult.rows[0].version,
      tables: tablesResult.rows.map((row) => row.table_name),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Funciones CRUD genéricas
export async function findAll(table: string) {
  try {
    const result = await query(`SELECT * FROM ${table} ORDER BY fecha_creacion DESC`)
    return result.rows
  } catch (error) {
    console.error(`Error al obtener todos los registros de ${table}:`, error)
    throw error
  }
}

export async function findById(table: string, id: number) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
    return result.rows[0] || null
  } catch (error) {
    console.error(`Error al obtener registro ${id} de ${table}:`, error)
    throw error
  }
}

export async function findByField(table: string, field: string, value: any) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value])
    return result.rows[0] || null
  } catch (error) {
    console.error(`Error al buscar en ${table} por ${field}:`, error)
    throw error
  }
}

export async function insert(table: string, data: any) {
  try {
    const fields = Object.keys(data).join(", ")
    const values = Object.values(data)
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ")

    const result = await query(
      `INSERT INTO ${table} (${fields}, fecha_creacion, fecha_actualizacion) 
       VALUES (${placeholders}, NOW(), NOW()) 
       RETURNING *`,
      values,
    )
    return result.rows[0]
  } catch (error) {
    console.error(`Error al insertar en ${table}:`, error)
    throw error
  }
}

export async function update(table: string, id: number, data: any) {
  try {
    const fields = Object.keys(data)
    const values = Object.values(data)
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ")

    const result = await query(
      `UPDATE ${table} SET ${setClause}, fecha_actualizacion = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id],
    )
    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar ${table}:`, error)
    throw error
  }
}

export async function remove(table: string, id: number) {
  try {
    const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id])
    return result.rows[0]
  } catch (error) {
    console.error(`Error al eliminar de ${table}:`, error)
    throw error
  }
}

// Función para logging de eventos de sincronización
export async function logSyncEvent(
  entidad: string,
  entidadId: string | null,
  accion: string,
  estado: string,
  descripcion: string,
  metadatos?: any,
) {
  try {
    // Primero, limpiar registros antiguos (mantener solo los últimos 10)
    await query(`
      DELETE FROM registro_actividad 
      WHERE id NOT IN (
        SELECT id FROM registro_actividad 
        ORDER BY fecha_creacion DESC 
        LIMIT 10
      )
    `)

    // Insertar nuevo registro
    const result = await query(
      `INSERT INTO registro_actividad 
       (usuario_id, usuario_nombre, accion, entidad, entidad_id, descripcion, metadatos, fecha_creacion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        1, // usuario_id por defecto
        "Sistema", // usuario_nombre por defecto
        accion.toUpperCase(),
        entidad.toUpperCase(),
        entidadId,
        descripcion,
        metadatos ? JSON.stringify(metadatos) : null,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error al registrar evento de sincronización:", error)
    // No lanzar error para evitar que falle la operación principal
    return null
  }
}

export default pool
