// Este archivo es para mantener compatibilidad con el código existente
// Simplemente reexporta las funciones de collections.ts

import {
  fetchCollections,
  fetchCollectionById,
  fetchCollectionProducts,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductsToCollection,
  removeProductsFromCollection,
  fetchProductsNotInCollection,
  addProductToCollection,
  removeProductFromCollection,
} from "./collections"

export {
  fetchCollections,
  fetchCollectionById,
  fetchCollectionProducts,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductsToCollection,
  removeProductsFromCollection,
  fetchProductsNotInCollection,
  addProductToCollection,
  removeProductFromCollection,
}
