// lib/api/products.ts

// Asegurarse de que el estado del producto se normalice correctamente
const normalizeProductStatus = (status) => {
  if (!status) return "ACTIVE" // Por defecto, considerar productos como activos

  // Normalizar el estado a mayúsculas
  const normalizedStatus = status.toUpperCase()

  // Validar que sea uno de los estados válidos
  if (["ACTIVE", "DRAFT", "ARCHIVED"].includes(normalizedStatus)) {
    return normalizedStatus
  }

  return "ACTIVE" // Si no es un estado válido, considerarlo activo
}

// Función para obtener todos los productos
export const fetchProducts = async () => {
  try {
    const response = await fetch("/api/shopify/products")
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`)
    }
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// Función para obtener un producto por ID
export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`/api/shopify/products/${id}`)
    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`)
    }
    const data = await response.json()
    return data.product
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }
}

// Función para actualizar un producto
export const updateProduct = async (id, productData) => {
  try {
    const response = await fetch(`/api/shopify/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error(`Error updating product: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

// Función para eliminar un producto
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`/api/shopify/products/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error deleting product: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}

// Función para crear un nuevo producto
export const createProduct = async (productData) => {
  try {
    const response = await fetch("/api/shopify/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error(`Error creating product: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

// Función para obtener el nivel de inventario
export const getInventoryLevel = async (variantId) => {
  try {
    const response = await fetch(`/api/shopify/inventory/${variantId}`)
    if (!response.ok) {
      throw new Error(`Error fetching inventory level: ${response.statusText}`)
    }
    const data = await response.json()
    return data.inventoryLevel || 0
  } catch (error) {
    console.error(`Error fetching inventory level for variant ${variantId}:`, error)
    throw error
  }
}

// Función para actualizar el nivel de inventario
export const updateInventoryLevel = async (variantId, quantity) => {
  try {
    const response = await fetch(`/api/shopify/inventory/${variantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    })

    if (!response.ok) {
      throw new Error(`Error updating inventory level: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating inventory level for variant ${variantId}:`, error)
    throw error
  }
}

// Función para obtener productos con stock bajo
export const fetchLowStockProducts = async (threshold = 5) => {
  try {
    const response = await fetch(`/api/shopify/products/low-stock?threshold=${threshold}`)
    if (!response.ok) {
      throw new Error(`Error fetching low stock products: ${response.statusText}`)
    }
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return []
  }
}
