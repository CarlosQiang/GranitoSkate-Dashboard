import {
  fetchPromotions,
  fetchPromotionById,
  createPromotion,
  deletePromotion,
  updatePromotion,
  fetchPriceListById,
  deletePriceList,
} from "./promotions"

// Exportar funciones con nombres en español
export const obtenerPromociones = fetchPromotions
export const obtenerPromocionPorId = fetchPromotionById
export const crearPromocion = createPromotion
export const eliminarPromocion = deletePromotion
export const actualizarPromocion = updatePromotion

// Alias para compatibilidad
export const obtenerListasPrecios = fetchPromotions
export const eliminarListaPrecio = eliminarPromocion

export {
  fetchPromotions,
  fetchPromotionById,
  createPromotion,
  deletePromotion,
  updatePromotion,
  fetchPriceListById,
  deletePriceList,
}

// Función para obtener promociones
// export async function obtenerPromociones(limit = 20) {
//   return fetchPromotions(limit);
// }
