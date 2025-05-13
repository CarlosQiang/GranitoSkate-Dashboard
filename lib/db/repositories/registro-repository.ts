import { db } from "../neon"
import { registro_sincronizacion } from "../schema"

export async function logSyncEvent(data: {
  tipo_entidad: string
  entidad_id?: string
  accion: string
  resultado: string
  mensaje?: string
  detalles?: any
}) {
  return db
    .insert(registro_sincronizacion)
    .values({
      tipo_entidad: data.tipo_entidad,
      entidad_id: data.entidad_id,
      accion: data.accion,
      resultado: data.resultado,
      mensaje: data.mensaje,
      detalles: data.detalles ? data.detalles : null,
      fecha: new Date(),
    })
    .returning()
}

export async function getRecentSyncEvents(limit = 50) {
  return db.select().from(registro_sincronizacion).orderBy(registro_sincronizacion.fecha).limit(limit)
}

export async function getSyncEventsByEntity(tipo_entidad: string, entidad_id?: string, limit = 50) {
  let query = db.select().from(registro_sincronizacion).where(registro_sincronizacion.tipo_entidad, tipo_entidad)

  if (entidad_id) {
    query = query.where(registro_sincronizacion.entidad_id, entidad_id)
  }

  return query.orderBy(registro_sincronizacion.fecha).limit(limit)
}
