// Caché para mejorar rendimiento
const promocionesCache = null
const lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export type EstadoPromocion = "activa" | "programada" | "expirada" | "desconocido"
export type TipoPromocion = "PORCENTAJE_DESCUENTO" | "CANTIDAD_FIJA" | "COMPRA_X_LLEVA_Y" | "ENVIO_GRATIS"

export type Promocion = {
  id: string
  titulo: string
  codigo: string | null
  esAutomatica: boolean
  fechaInicio: string
  fechaFin: string | null
  estado: EstadoPromocion
  tipo: string
  valor: string
  moneda: string
  descripcion: string | null
  error?: boolean
}

// Importar funciones desde promotions.ts
import {
  fetchPromotions,
  fetchPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  fetchPriceListById,
  createPriceList,
  updatePriceList,
  fetchPriceLists,
  deletePriceList,
  getPriceListById,
} from "./promotions"

// Exportar todas las funciones para mantener compatibilidad
export {
  fetchPromotions,
  fetchPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  fetchPriceListById,
  createPriceList,
  updatePriceList,
  fetchPriceLists,
  deletePriceList,
  getPriceListById,
}

// Alias en español para compatibilidad
export const obtenerPromociones = fetchPromotions
export const obtenerPromocionPorId = fetchPromotionById
export const crearPromocion = createPromotion
export const actualizarPromocion = updatePromotion
export const eliminarPromocion = deletePromotion
