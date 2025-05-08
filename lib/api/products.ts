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

// Añadir las funciones faltantes
export async function generateProductSeoMetafields(productData: any) {
  return {
    metafields: {
      title: `${productData.title || "Producto"} | GranitoSkate`,
      description: productData.description || "Descripción del producto no disponible",
      keywords: "skate, skateboard, granito skate",
    },
  }
}
