// Archivo simplificado para evitar dependencias de graphql-request
export async function fetchProducts() {
  return { products: [] }
}

export async function fetchProductById() {
  return { product: null }
}

export async function createProduct() {
  return { success: true, message: "Función temporalmente deshabilitada" }
}

export async function updateProduct() {
  return { success: true, message: "Función temporalmente deshabilitada" }
}

export async function deleteProduct() {
  return { success: true, message: "Función temporalmente deshabilitada" }
}
