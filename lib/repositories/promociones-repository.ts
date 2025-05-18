import { query, insert, update, findById, findAll, remove } from "@/lib/db"

export type Promocion = {
  id?: number
  titulo: string
  tipo?: string
  valor?: number
  fecha_inicio?: Date
  fecha_fin?: Date | null
  activa?: boolean
  datos_adicionales?: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export async function getAllPromociones() {
  return findAll("promociones")
}

export async function getPromocionById(id: number) {
  return findById("promociones", id)
}

export async function getPromocionesActivas() {
  try {
    const now = new Date()
    const result = await query(
      `SELECT * FROM promociones 
       WHERE activa = true 
       AND (fecha_inicio IS NULL OR fecha_inicio <= $1)
       AND (fecha_fin IS NULL OR fecha_fin >= $1)
       ORDER BY fecha_creacion DESC`,
      [now],
    )
    return result.rows
  } catch (error) {
    console.error("Error al obtener promociones activas:", error)
    throw error
  }
}

export async function createPromocion(promocion: Promocion) {
  return insert("promociones", promocion)
}

export async function updatePromocion(id: number, promocion: Partial<Promocion>) {
  return update("promociones", id, promocion)
}

export async function deletePromocion(id: number) {
  return remove("promociones", id)
}
