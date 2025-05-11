import {
  fetchPromotions,
  fetchPromotionById,
  createPromotion,
  deletePromotion,
  updatePromotion,
  fetchPriceListById,
  deletePriceList,
  createMarketingActivity,
} from "./promotions"

// Exportar funciones con nombres en español
export const obtenerPromociones = fetchPromotions
export const obtenerPromocionPorId = fetchPromotionById
export const crearPromocion = createPromotion
export const eliminarPromocion = deletePromotion
export const actualizarPromocion = updatePromotion

// Alias para compatibilidad
export const obtenerListasPrecios = fetchPromotions
export const eliminarListaPrecio = deletePromotion

// Re-exportar para compatibilidad con código existente
export { fetchPromotionById, fetchPriceListById, deletePriceList, createMarketingActivity }
