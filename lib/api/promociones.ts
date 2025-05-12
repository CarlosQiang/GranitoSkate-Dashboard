// Importar todas las funciones necesarias desde el archivo de promotions
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

// Reexportar todas las funciones para mantener compatibilidad
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
