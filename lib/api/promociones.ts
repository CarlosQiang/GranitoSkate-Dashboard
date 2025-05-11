import { fetchPromotions, fetchPromotionById, createPromotion, deletePromotion, updatePromotion } from "./promotions"

// Exportar funciones con nombres en español
export const obtenerPromociones = fetchPromotions
export const obtenerPromocionPorId = fetchPromotionById
export const crearPromocion = createPromotion
export const eliminarPromocion = deletePromotion
export const actualizarPromocion = updatePromotion

// Alias para compatibilidad
export { fetchPromotions, fetchPromotionById, createPromotion, deletePromotion, updatePromotion }
