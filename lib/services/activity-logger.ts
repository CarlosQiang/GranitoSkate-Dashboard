import { query } from "@/lib/db"

export interface ActivityLogEntry {
  usuarioId?: number
  usuarioNombre?: string
  accion: string
  entidad?: string
  entidadId?: string
  descripcion?: string
  metadatos?: any
  ipAddress?: string
  userAgent?: string
  resultado?: "SUCCESS" | "ERROR" | "WARNING"
  errorMensaje?: string
  duracionMs?: number
}

export class ActivityLogger {
  /**
   * Registra una actividad en la base de datos
   */
  static async log(entry: ActivityLogEntry) {
    try {
      // Limpiar registros antiguos (mantener solo los últimos 10)
      await this.cleanOldRecords()

      const sql = `
        INSERT INTO registros_actividad (
          usuario_id, usuario_nombre, accion, entidad, entidad_id, 
          descripcion, metadatos, ip_address, user_agent, resultado, 
          error_mensaje, duracion_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `

      const values = [
        entry.usuarioId || null,
        entry.usuarioNombre || null,
        entry.accion,
        entry.entidad || null,
        entry.entidadId || null,
        entry.descripcion || null,
        entry.metadatos ? JSON.stringify(entry.metadatos) : null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.resultado || "SUCCESS",
        entry.errorMensaje || null,
        entry.duracionMs || null,
      ]

      await query(sql, values)
    } catch (error) {
      console.error("Error al registrar actividad:", error)
      // No lanzamos el error para evitar interrumpir el flujo principal
    }
  }

  /**
   * Registra un login exitoso
   */
  static async logLogin(userId: number, userName: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      usuarioId: userId,
      usuarioNombre: userName,
      accion: "LOGIN",
      entidad: "AUTH",
      descripcion: `Usuario ${userName} inició sesión`,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Registra un logout
   */
  static async logLogout(userId: number, userName: string) {
    await this.log({
      usuarioId: userId,
      usuarioNombre: userName,
      accion: "LOGOUT",
      entidad: "AUTH",
      descripcion: `Usuario ${userName} cerró sesión`,
    })
  }

  /**
   * Registra una llamada a la API de Shopify
   */
  static async logShopifyCall(
    userId: number,
    userName: string,
    endpoint: string,
    method: string,
    resultado: "SUCCESS" | "ERROR",
    duracionMs: number,
    errorMensaje?: string,
    metadatos?: any,
  ) {
    await this.log({
      usuarioId: userId,
      usuarioNombre: userName,
      accion: "SHOPIFY_API_CALL",
      entidad: "SHOPIFY",
      entidadId: endpoint,
      descripcion: `${method} ${endpoint}`,
      metadatos,
      resultado,
      errorMensaje,
      duracionMs,
    })
  }

  /**
   * Registra un error del sistema
   */
  static async logSystemError(error: Error, context?: string, userId?: number) {
    await this.log({
      usuarioId: userId,
      accion: "SYSTEM_ERROR",
      entidad: "SYSTEM",
      descripcion: context || "Error del sistema",
      errorMensaje: error.message,
      resultado: "ERROR",
      metadatos: {
        stack: error.stack,
        name: error.name,
      },
    })
  }

  /**
   * Obtiene los registros de actividad más recientes
   */
  static async getRecentActivity(limit = 10) {
    try {
      const sql = `
        SELECT * FROM registros_actividad 
        ORDER BY fecha_creacion DESC 
        LIMIT $1
      `
      const result = await query(sql, [limit])
      return result.rows
    } catch (error) {
      console.error("Error al obtener registros de actividad:", error)
      return []
    }
  }

  /**
   * Limpia registros antiguos manteniendo solo los últimos 10
   */
  static async cleanOldRecords() {
    try {
      const sql = `
        DELETE FROM registros_actividad 
        WHERE id NOT IN (
          SELECT id FROM registros_actividad 
          ORDER BY fecha_creacion DESC 
          LIMIT 10
        )
      `
      await query(sql)
    } catch (error) {
      console.error("Error al limpiar registros antiguos:", error)
    }
  }

  /**
   * Obtiene estadísticas de actividad
   */
  static async getActivityStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_registros,
          COUNT(CASE WHEN resultado = 'SUCCESS' THEN 1 END) as exitosos,
          COUNT(CASE WHEN resultado = 'ERROR' THEN 1 END) as errores,
          COUNT(DISTINCT usuario_id) as usuarios_activos
        FROM registros_actividad
        WHERE fecha_creacion >= NOW() - INTERVAL '24 hours'
      `
      const result = await query(sql)
      return (
        result.rows[0] || {
          total_registros: 0,
          exitosos: 0,
          errores: 0,
          usuarios_activos: 0,
        }
      )
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      return {
        total_registros: 0,
        exitosos: 0,
        errores: 0,
        usuarios_activos: 0,
      }
    }
  }
}
