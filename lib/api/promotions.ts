import {
  obtenerPromociones,
  obtenerPromocionPorId,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
  type Promocion,
  type EstadoPromocion,
} from "./promociones"

// Tipos para compatibilidad
export type PromotionStatus = EstadoPromocion
export interface Promotion
  extends Omit<
    Promocion,
    | "titulo"
    | "resumen"
    | "fechaInicio"
    | "fechaFin"
    | "estado"
    | "objetivo"
    | "tipoValor"
    | "valor"
    | "limiteUso"
    | "contadorUso"
    | "codigo"
    | "fechaCreacion"
    | "fechaActualizacion"
  > {
  title: string
  summary: string
  startsAt: string
  endsAt?: string
  status: PromotionStatus
  target: string
  valueType: string
  value: string
  usageLimit?: number
  usageCount: number
  code?: string
  createdAt: string
  updatedAt: string
}

// Función para convertir de Promocion a Promotion
function convertToPromotion(promocion: Promocion): Promotion {
  return {
    id: promocion.id,
    title: promocion.titulo,
    summary: promocion.resumen,
    startsAt: promocion.fechaInicio,
    endsAt: promocion.fechaFin,
    status: promocion.estado,
    target: promocion.objetivo,
    valueType: promocion.tipoValor,
    value: promocion.valor,
    usageLimit: promocion.limiteUso,
    usageCount: promocion.contadorUso,
    code: promocion.codigo,
    createdAt: promocion.fechaCreacion,
    updatedAt: promocion.fechaActualizacion,
  }
}

// Función para convertir de Promotion a Promocion
function convertToPromocion(promotion: Partial<Promotion>): Partial<Promocion> {
  const result: Partial<Promocion> = {}

  if (promotion.id !== undefined) result.id = promotion.id
  if (promotion.title !== undefined) result.titulo = promotion.title
  if (promotion.summary !== undefined) result.resumen = promotion.summary
  if (promotion.startsAt !== undefined) result.fechaInicio = promotion.startsAt
  if (promotion.endsAt !== undefined) result.fechaFin = promotion.endsAt
  if (promotion.status !== undefined) result.estado = promotion.status
  if (promotion.target !== undefined) result.objetivo = promotion.target
  if (promotion.valueType !== undefined) result.tipoValor = promotion.valueType
  if (promotion.value !== undefined) result.valor = promotion.value
  if (promotion.usageLimit !== undefined) result.limiteUso = promotion.usageLimit
  if (promotion.usageCount !== undefined) result.contadorUso = promotion.usageCount
  if (promotion.code !== undefined) result.codigo = promotion.code
  if (promotion.createdAt !== undefined) result.fechaCreacion = promotion.createdAt
  if (promotion.updatedAt !== undefined) result.fechaActualizacion = promotion.updatedAt

  return result
}

/**
 * Obtiene todas las promociones (price rules) de Shopify
 * @returns Lista de promociones
 */
export async function fetchPromotions(limit = 50): Promise<Promotion[]> {
  try {
    const promociones = await obtenerPromociones(limit)
    return promociones.map(convertToPromotion)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción
 */
export async function fetchPromotionById(id: string): Promise<Promotion | null> {
  try {
    const promocion = await obtenerPromocionPorId(id)
    return promocion ? convertToPromotion(promocion) : null
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error al cargar promoción: ${(error as Error).message}`)
  }
}

/**
 * Crea una nueva promoción (price rule)
 * @param data Datos de la promoción
 * @returns La promoción creada
 */
export async function createPromotion(data: any): Promise<any> {
  try {
    const promocionData = convertToPromocion(data)
    const result = await crearPromocion(promocionData)
    return {
      id: result.id,
      title: result.titulo,
      ...data,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear promoción: ${(error as Error).message}`)
  }
}

/**
 * Actualiza una promoción existente
 * @param id ID de la promoción
 * @param data Datos a actualizar
 * @returns La promoción actualizada
 */
export async function updatePromotion(id: string, data: any): Promise<any> {
  try {
    const promocionData = convertToPromocion(data)
    const result = await actualizarPromocion(id, promocionData)
    return {
      id: result.id,
      title: result.titulo,
      ...data,
    }
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error)
    throw new Error(`Error al actualizar promoción: ${(error as Error).message}`)
  }
}

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns Success status and ID
 */
export async function deletePromotion(id: string): Promise<any> {
  try {
    return await eliminarPromocion(id)
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${(error as Error).message}`)
  }
}

// Alias para compatibilidad
export const fetchPriceListById = fetchPromotionById
export const createPriceList = createPromotion
export const updatePriceList = updatePromotion
export const deletePriceList = deletePromotion
export const getPriceListById = fetchPromotionById
