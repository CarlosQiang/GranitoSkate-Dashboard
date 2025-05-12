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
} from "./promotions"

// Exportamos directamente las funciones
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
}

// Alias en español para compatibilidad
export const obtenerPromociones = fetchPromotions
export const obtenerPromocionPorId = fetchPromotionById
export const crearPromocion = createPromotion
export const actualizarPromocion = updatePromotion
export const eliminarPromocion = deletePromotion
