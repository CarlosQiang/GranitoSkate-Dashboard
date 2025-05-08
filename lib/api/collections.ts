// Archivo simplificado para evitar dependencias de graphql-request
export async function fetchCollections() {
  return { collections: [] }
}

export async function createCollection() {
  return { success: true, message: "Función temporalmente deshabilitada" }
}

// Añadir las funciones faltantes
export async function addProductsToCollection(collectionId: string, productIds: string[]) {
  return { success: true, message: "Función temporalmente deshabilitada" }
}

export async function removeProductsFromCollection(collectionId: string, productIds: string[]) {
  return { success: true, message: "Función temporalmente deshabilitada" }
}
