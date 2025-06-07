import { sql } from "@vercel/postgres"

export interface SyncEvent {
  tipo_entidad: string
  entidad_id?: string
  accion: string
  resultado: string
  mensaje?: string
  detalles?: any
}

export async function logSyncEvent(event: SyncEvent) {
  try {
    const { tipo_entidad, entidad_id, accion, resultado, mensaje, detalles } = event

    const result = await sql`
      INSERT INTO registro_sincronizacion 
      (tipo_entidad, entidad_id, accion, resultado, mensaje, detalles) 
      VALUES (${tipo_entidad}, ${entidad_id}, ${accion}, ${resultado}, ${mensaje}, ${detalles ? JSON.stringify(detalles) : null})
      RETURNING id
    `

    return result.rows[0].id
  } catch (error) {
    console.error("Error logging sync event:", error)
    // No lanzar error para evitar interrumpir el flujo principal
    return null
  }
}

export async function getRecentSyncEvents(limit = 50) {
  try {
    const result = await sql`
      SELECT * FROM registro_sincronizacion 
      ORDER BY fecha DESC 
      LIMIT ${limit}
    `
    return result.rows
  } catch (error) {
    console.error("Error getting recent sync events:", error)
    return []
  }
}

export async function getSyncEventsByType(tipo: string, limit = 50) {
  try {
    const result = await sql`
      SELECT * FROM registro_sincronizacion 
      WHERE tipo_entidad = ${tipo}
      ORDER BY fecha DESC 
      LIMIT ${limit}
    `
    return result.rows
  } catch (error) {
    console.error(`Error getting sync events for type ${tipo}:`, error)
    return []
  }
}

export async function getSyncEventsByEntity(tipo: string, entidadId: string, limit = 50) {
  try {
    const result = await sql`
      SELECT * FROM registro_sincronizacion 
      WHERE tipo_entidad = ${tipo} AND entidad_id = ${entidadId}
      ORDER BY fecha DESC 
      LIMIT ${limit}
    `
    return result.rows
  } catch (error) {
    console.error(`Error getting sync events for entity ${tipo}/${entidadId}:`, error)
    return []
  }
}

// Función para obtener todos los registros
export async function obtenerRegistros(limite = 100) {
  try {
    const result = await sql`
      SELECT * FROM registro 
      ORDER BY fecha DESC 
      LIMIT ${limite}
    `
    return {
      success: true,
      registros: result.rows,
      total: result.rows.length,
    }
  } catch (error) {
    console.error("Error obteniendo registros:", error)
    return {
      success: false,
      error: `Error obteniendo registros: ${error instanceof Error ? error.message : "Error desconocido"}`,
      registros: [],
      total: 0,
    }
  }
}

// Función para registrar un evento (implementación que faltaba)
export async function registrarEvento(tipo: string, descripcion: string, detalles: any = null) {
  try {
    console.log(`📝 Registrando evento: ${tipo} - ${descripcion}`)

    // Crear la tabla si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS registro (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT NOT NULL,
        detalles JSONB,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insertar el registro
    const result = await sql`
      INSERT INTO registro (tipo, descripcion, detalles)
      VALUES (${tipo}, ${descripcion}, ${detalles ? JSON.stringify(detalles) : null})
      RETURNING *
    `

    if (result.rows.length > 0) {
      console.log(`✅ Evento registrado con ID: ${result.rows[0].id}`)
      return {
        success: true,
        registro: result.rows[0],
      }
    }

    return {
      success: false,
      error: "Error al registrar el evento",
    }
  } catch (error) {
    console.error("❌ Error registrando evento:", error)
    return {
      success: false,
      error: `Error registrando evento: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Función para obtener registros por tipo
export async function obtenerRegistrosPorTipo(tipo: string, limite = 50) {
  try {
    const result = await sql`
      SELECT * FROM registro 
      WHERE tipo = ${tipo}
      ORDER BY fecha DESC 
      LIMIT ${limite}
    `
    return {
      success: true,
      registros: result.rows,
      total: result.rows.length,
    }
  } catch (error) {
    console.error(`Error obteniendo registros de tipo ${tipo}:`, error)
    return {
      success: false,
      error: `Error obteniendo registros: ${error instanceof Error ? error.message : "Error desconocido"}`,
      registros: [],
      total: 0,
    }
  }
}

// Función para limpiar registros antiguos
export async function limpiarRegistrosAntiguos(diasAntiguedad = 30) {
  try {
    const result = await sql`
      DELETE FROM registro 
      WHERE fecha < NOW() - INTERVAL '${diasAntiguedad} days'
      RETURNING COUNT(*) as eliminados
    `

    const eliminados = result.rows[0]?.eliminados || 0

    return {
      success: true,
      eliminados,
      message: `Se eliminaron ${eliminados} registros antiguos`,
    }
  } catch (error) {
    console.error("Error limpiando registros antiguos:", error)
    return {
      success: false,
      error: `Error limpiando registros: ${error instanceof Error ? error.message : "Error desconocido"}`,
      eliminados: 0,
    }
  }
}
