interface ActivityLogEntry {
  id: string
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
  fecha_creacion: Date
}

// Almacenamiento en memoria (máximo 10 registros)
let activityLogs: ActivityLogEntry[] = []

export class ActivityLogger {
  /**
   * Registra una actividad
   */
  static async log(entry: Omit<ActivityLogEntry, "id" | "fecha_creacion">) {
    try {
      const newEntry: ActivityLogEntry = {
        id: Date.now().toString(),
        ...entry,
        resultado: entry.resultado || "SUCCESS",
        fecha_creacion: new Date(),
      }

      // Agregar al inicio del array
      activityLogs.unshift(newEntry)

      // Mantener solo los últimos 10 registros
      if (activityLogs.length > 10) {
        activityLogs = activityLogs.slice(0, 10)
      }

      console.log("Actividad registrada:", newEntry)
    } catch (error) {
      console.error("Error al registrar actividad:", error)
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
    return activityLogs.slice(0, Math.min(limit, activityLogs.length))
  }

  /**
   * Obtiene estadísticas de actividad
   */
  static async getActivityStats() {
    const total = activityLogs.length
    const exitosos = activityLogs.filter((log) => log.resultado === "SUCCESS").length
    const errores = activityLogs.filter((log) => log.resultado === "ERROR").length
    const usuariosActivos = new Set(activityLogs.map((log) => log.usuarioId).filter(Boolean)).size

    return {
      total_registros: total,
      exitosos,
      errores,
      usuarios_activos: usuariosActivos,
    }
  }

  /**
   * Obtiene el conteo de registros
   */
  static async getConteoRegistros() {
    return activityLogs.length
  }

  /**
   * Obtiene registros con filtros
   */
  static async getRegistros(filtros: any = {}) {
    let registrosFiltrados = [...activityLogs]

    if (filtros.accion) {
      registrosFiltrados = registrosFiltrados.filter((log) => log.accion === filtros.accion)
    }

    if (filtros.entidad) {
      registrosFiltrados = registrosFiltrados.filter((log) => log.entidad === filtros.entidad)
    }

    if (filtros.resultado) {
      registrosFiltrados = registrosFiltrados.filter((log) => log.resultado === filtros.resultado)
    }

    if (filtros.usuarioId) {
      registrosFiltrados = registrosFiltrados.filter((log) => log.usuarioId === filtros.usuarioId)
    }

    return registrosFiltrados.slice(0, filtros.limite || 10).map((log) => ({
      ...log,
      admin_nombre_completo: log.usuarioNombre || "Sistema",
    }))
  }
}
