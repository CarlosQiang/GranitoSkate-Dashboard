// Este archivo es un puente para mantener compatibilidad con código existente
// Importa y reexporta las funciones de collections.ts con nombres en español

import {
  fetchCollections,
  fetchCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductsToCollection,
  removeProductsFromCollection,
  fetchProductsNotInCollection,
  addProductToCollection,
  removeProductFromCollection,
} from "./collections"

// Exportar las funciones con nombres en español para mantener compatibilidad
export const obtenerColecciones = fetchCollections
export const obtenerColeccionPorId = fetchCollectionById
export const crearColeccion = createCollection
export const actualizarColeccion = updateCollection
export const eliminarColeccion = deleteCollection
export const agregarProductoAColeccion = addProductsToCollection
export const eliminarProductoDeColeccion = removeProductsFromCollection
export const obtenerProductosNoEnColeccion = fetchProductsNotInCollection

// También exportamos las funciones con nombres en inglés para compatibilidad
export {
  fetchCollections,
  fetchCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductsToCollection,
  removeProductsFromCollection,
  fetchProductsNotInCollection,
  addProductToCollection,
  removeProductFromCollection,
}
