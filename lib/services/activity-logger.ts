import { query } from "@/lib/db"

export class ActivityLogger {
  /**
   * Registra una actividad y mantiene solo los últimos 10 registros
   */
  static async log(params: {
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
  }) {
    try {
      const {
        usuarioId,
        usuarioNombre,
        accion,
        entidad,
        entidadId,
        descripcion,
        metadatos,
        ipAddress,
        userAgent,
        resultado = "SUCCESS",
        errorMensaje,
        duracionMs,
      } = params

      // Insertar nuevo registro
      const result = await query(
        `INSERT INTO registros_actividad (
          usuario_id, usuario_nombre, accion, entidad, entidad_id,
          descripcion, metadatos, ip_address, user_agent, resultado,
          error_mensaje, duracion_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
        [
          usuarioId,
          usuarioNombre,
          accion,
          entidad,
          entidadId,
          descripcion,
          metadatos ? JSON.stringify(metadatos) : null,
          ipAddress,
          userAgent,
          resultado,
          errorMensaje,
          duracionMs,
        ],
      )

      // Limpiar registros antiguos - mantener solo los últimos 10
      await query(
        `DELETE FROM registros_actividad 
         WHERE id NOT IN (
           SELECT id FROM registros_actividad 
           ORDER BY fecha_creacion DESC 
           LIMIT 10
         )`,
      )

      return result.rows[0].id
    } catch (error) {
      console.error("Error al registrar actividad:", error)
      return null
    }
  }

  /**
   * Registra login de usuario
   */
  static async logLogin(usuarioId: number, usuarioNombre: string, ipAddress?: string, userAgent?: string) {
    return this.log({
      usuarioId,
      usuarioNombre,
      accion: "LOGIN",
      entidad: "ADMIN",
      entidadId: usuarioId.toString(),
      descripcion: `Usuario ${usuarioNombre} inició sesión`,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Registra logout de usuario
   */
  static async logLogout(usuarioId: number, usuarioNombre: string, ipAddress?: string) {
    return this.log({
      usuarioId,
      usuarioNombre,
      accion: "LOGOUT",
      entidad: "ADMIN",
      entidadId: usuarioId.toString(),
      descripcion: `Usuario ${usuarioNombre} cerró sesión`,
      ipAddress,
    })
  }

  /**
   * Registra cambio en administradores
   */
  static async logAdminChange(
    usuarioId: number,
    usuarioNombre: string,
    accion: "CREATE" | "UPDATE" | "DELETE",
    adminAfectadoId: string,
    adminAfectadoNombre: string,
  ) {
    const acciones = {
      CREATE: "creó",
      UPDATE: "modificó",
      DELETE: "eliminó",
    }

    return this.log({
      usuarioId,
      usuarioNombre,
      accion: `ADMIN_${accion}`,
      entidad: "ADMIN",
      entidadId: adminAfectadoId,
      descripcion: `${usuarioNombre} ${acciones[accion]} al administrador ${adminAfectadoNombre}`,
    })
  }

  /**
   * Registra llamada a API de Shopify
   */
  static async logShopifyCall(
    usuarioId: number,
    usuarioNombre: string,
    endpoint: string,
    metodo: string,
    resultado: "SUCCESS" | "ERROR",
    duracionMs?: number,
    errorMensaje?: string,
    metadatos?: any,
  ) {
    return this.log({
      usuarioId,
      usuarioNombre,
      accion: "SHOPIFY_API_CALL",
      entidad: "SHOPIFY",
      entidadId: endpoint,
      descripcion: `${metodo} ${endpoint}`,
      metadatos: {
        endpoint,
        metodo,
        ...metadatos,
      },
      resultado,
      errorMensaje,
      duracionMs,
    })
  }

  /**
   * Registra error del sistema
   */
  static async logSystemError(error: Error, contexto?: string, usuarioId?: number) {
    return this.log({
      usuarioId,
      accion: "SYSTEM_ERROR",
      entidad: "SYSTEM",
      descripcion: contexto || "Error del sistema",
      resultado: "ERROR",
      errorMensaje: error.message,
      metadatos: {
        stack: error.stack,
        contexto,
      },
    })
  }

  /**
   * Obtiene los últimos registros (máximo 10)
   */
  static async getRegistros(
    filtros: {
      usuarioId?: number
      accion?: string
      entidad?: string
      resultado?: string
      limite?: number
    } = {},
  ) {
    try {
      const { usuarioId, accion, entidad, resultado, limite = 10 } = filtros

      let whereClause = "WHERE 1=1"
      const params: any[] = []
      let paramIndex = 1

      if (usuarioId) {
        whereClause += ` AND usuario_id = $${paramIndex}`
        params.push(usuarioId)
        paramIndex++
      }

      if (accion) {
        whereClause += ` AND accion = $${paramIndex}`
        params.push(accion)
        paramIndex++
      }

      if (entidad) {
        whereClause += ` AND entidad = $${paramIndex}`
        params.push(entidad)
        paramIndex++
      }

      if (resultado) {
        whereClause += ` AND resultado = $${paramIndex}`
        params.push(resultado)
        paramIndex++
      }

      params.push(Math.min(limite, 10)) // Máximo 10 registros

      const result = await query(
        `SELECT r.*, a.nombre_completo as admin_nombre_completo
         FROM registros_actividad r
         LEFT JOIN administradores a ON r.usuario_id = a.id
         ${whereClause}
         ORDER BY r.fecha_creacion DESC
         LIMIT $${paramIndex}`,
        params,
      )

      return result.rows
    } catch (error) {
      console.error("Error al obtener registros:", error)
      return []
    }
  }

  /**
   * Obtiene estadísticas de los registros actuales
   */
  static async getEstadisticas() {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as total_registros,
          COUNT(CASE WHEN resultado = 'SUCCESS' THEN 1 END) as exitosos,
          COUNT(CASE WHEN resultado = 'ERROR' THEN 1 END) as errores,
          COUNT(CASE WHEN resultado = 'WARNING' THEN 1 END) as advertencias,
          COUNT(DISTINCT usuario_id) as usuarios_activos,
          COUNT(CASE WHEN accion = 'LOGIN' THEN 1 END) as total_logins,
          COUNT(CASE WHEN accion LIKE 'SHOPIFY%' THEN 1 END) as llamadas_shopify
         FROM registros_actividad`,
      )

      return result.rows[0]
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      return null
    }
  }

  /**
   * Obtiene el conteo actual de registros
   */
  static async getConteoRegistros() {
    try {
      const result = await query("SELECT COUNT(*) as total FROM registros_actividad")
      return Number.parseInt(result.rows[0].total)
    } catch (error) {
      console.error("Error al obtener conteo:", error)
      return 0
    }
  }
}
