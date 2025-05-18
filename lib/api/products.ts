// Función para obtener productos recientes
export async function fetchRecentProducts(limit = 5) {
  try {
    // Simulamos productos para evitar errores
    return [
      {
        id: 1,
        title: "Producto de prueba 1",
        status: "ACTIVE",
        image: null,
      },
      {
        id: 2,
        title: "Producto de prueba 2",
        status: "DRAFT",
        image: null,
      },
    ]
  } catch (error) {
    console.error("Error al obtener productos recientes:", error)
    return []
  }
}

// Función para obtener productos con stock bajo
export async function fetchLowStockProducts(threshold = 10) {
  try {
    // Simulamos productos para evitar errores
    return [
      {
        id: 1,
        title: "Producto de prueba 1",
        quantity: 5,
        inventoryPolicy: "DENY",
      },
      {
        id: 2,
        title: "Producto de prueba 2",
        quantity: 3,
        inventoryPolicy: "CONTINUE",
      },
    ]
  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error)
    return []
  }
}

// Función para obtener todos los productos
export async function fetchProducts(limit = 20) {
  try {
    // Simulamos productos para evitar errores
    return [
      {
        id: 1,
        title: "Producto de prueba 1",
        status: "ACTIVE",
        image: null,
        price: "19.99",
        inventoryQuantity: 10,
        productType: "Skate",
        vendor: "Granito",
      },
      {
        id: 2,
        title: "Producto de prueba 2",
        status: "DRAFT",
        image: null,
        price: "29.99",
        inventoryQuantity: 5,
        productType: "Accesorios",
        vendor: "Granito",
      },
    ]
  } catch (error) {
    console.error("Error al obtener todos los productos:", error)
    return []
  }
}

// Función para obtener un producto por ID
export async function fetchProductById(id) {
  try {
    // Simulamos un producto para evitar errores
    return {
      id: id,
      title: `Producto ${id}`,
      description: "Descripción del producto",
      status: "ACTIVE",
      vendor: "Granito",
      productType: "Skate",
      tags: ["skate", "deportes"],
      featuredImage: null,
      images: [],
      variants: [
        {
          id: 1,
          title: "Default",
          price: "19.99",
          compareAtPrice: null,
          inventoryQuantity: 10,
          inventoryPolicy: "DENY",
          sku: "SKU123",
          barcode: "123456789",
        },
      ],
      collections: [],
      metafields: [],
    }
  } catch (error) {
    console.error(`Error al obtener el producto con ID ${id}:`, error)
    return null
  }
}

// Función para crear un nuevo producto
export async function createProduct(productData) {
  try {
    console.log("Creando producto:", productData)
    return { id: "new-product-id" }
  } catch (error) {
    console.error("Error al crear el producto:", error)
    throw error
  }
}

// Función para actualizar un producto
export async function updateProduct(id, productData) {
  try {
    console.log("Actualizando producto:", id, productData)
    return { id }
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${id}:`, error)
    throw error
  }
}

// Función para actualizar el nivel de inventario
export async function updateInventoryLevel(variantId, quantity) {
  try {
    console.log("Actualizando inventario:", variantId, quantity)
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar el nivel de inventario:", error)
    throw error
  }
}

// Función para obtener el nivel de inventario actual
export async function getInventoryLevel(variantId) {
  try {
    return 10 // Valor simulado
  } catch (error) {
    console.error("Error al obtener el nivel de inventario:", error)
    return 0
  }
}

// Función para eliminar un producto
export async function deleteProduct(id) {
  try {
    console.log("Eliminando producto:", id)
    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${id}:`, error)
    throw error
  }
}
