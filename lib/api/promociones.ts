export type EstadoPromocion = "ACTIVE" | "EXPIRED" | "SCHEDULED" | "INACTIVE"

export interface Promocion {
  id: string
  titulo: string
  resumen?: string
  fechaInicio: string
  fechaFin?: string
  estado: EstadoPromocion
  objetivo: string
  objetivoId?: string
  tipoValor: string
  valor: string
  limiteUso?: number
  contadorUso: number
  codigo?: string
  condiciones: any[]
  precios?: any[]
  fechaCreacion: string
  fechaActualizacion: string
}

export async function obtenerPromociones(limit = 50): Promise<Promocion[]> {
  console.log("Fake obtenerPromociones implementation")
  return []
}

export async function obtenerPromocionPorId(id: string): Promise<Promocion | null> {
  console.log("Fake obtenerPromocionPorId implementation")
  return null
}

export async function crearPromocion(data: any): Promise<any> {
  console.log("Fake crearPromocion implementation")
  return {}
}

export async function actualizarPromocion(id: string, data: any): Promise<any> {
  console.log("Fake actualizarPromocion implementation")
  return {}
}

export async function eliminarPromocion(id: string): Promise<any> {
  console.log("Fake eliminarPromocion implementation")
  return {}
}
