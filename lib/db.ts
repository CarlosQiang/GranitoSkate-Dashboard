// Función logSyncEvent para registrar eventos de sincronización
export async function logSyncEvent(
  tipo: string,
  entidad_id: string | null,
  accion: string,
  estado: string,
  mensaje: string,
  datos_adicionales?: any,
) {
  try {
    const result = await query(
      `INSERT INTO registro_sincronizacion 
       (tipo, entidad_id, accion, estado, mensaje, datos_adicionales, fecha_evento) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [tipo, entidad_id, accion, estado, mensaje, JSON.stringify(datos_adicionales || {})],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error al registrar evento de sincronización:", error)
    // No lanzar error para evitar que falle la operación principal
    return null
  }
}
