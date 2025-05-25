export interface Product {
  id: string
  title: string
  description: string
  descriptionHtml: string
  status: string
  vendor: string
  productType: string
  handle: string
  tags: string[]
  featuredImage?: {
    id: string
    url: string
    altText: string
  }
  images: Array<{
    id: string
    url: string
    altText: string
  }>
  variants: Array<{
    id: string
    title: string
    price: string
    compareAtPrice: string
    sku: string
    barcode: string
    inventoryQuantity: number
    weight: number
    weightUnit: string
  }>
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Función para obtener productos desde la API
export async function fetchProducts(limit = 50, cursor?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams()
    params.append("limit", limit.toString())
    if (cursor) {
      params.append("cursor", cursor)
    }

    const response = await fetch(`/api/shopify/products?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || result.message || "Error al obtener productos")
    }

    return result.data || []
  } catch (error) {
    console.error("Error en fetchProducts:", error)
    throw error
  }
}

// Función para obtener un producto por ID
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    // Limpiar el ID si viene con el prefijo gid://
    const cleanId = id.replace("gid://shopify/Product/", "")

    const response = await fetch(`/api/shopify/products/${cleanId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || result.message || "Error al obtener producto")
    }

    return result.data
  } catch (error) {
    console.error("Error en fetchProductById:", error)
    throw error
  }
}

// Función para crear un producto
export async function createProduct(productData: any): Promise<Product | null> {
  try {
    const response = await fetch("/api/shopify/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || result.message || "Error al crear producto")
    }

    return result.data
  } catch (error) {
    console.error("Error en createProduct:", error)
    throw error
  }
}

// Función para actualizar un producto
export async function updateProduct(id: string, productData: any): Promise<Product | null> {
  try {
    const cleanId = id.replace("gid://shopify/Product/", "")

    const response = await fetch(`/api/shopify/products/${cleanId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || result.message || "Error al actualizar producto")
    }

    return result.data
  } catch (error) {
    console.error("Error en updateProduct:", error)
    throw error
  }
}

// Función para eliminar un producto
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const cleanId = id.replace("gid://shopify/Product/", "")

    const response = await fetch(`/api/shopify/products/${cleanId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || result.message || "Error al eliminar producto")
    }

    return true
  } catch (error) {
    console.error("Error en deleteProduct:", error)
    throw error
  }
}

// Funciones adicionales para compatibilidad
export async function fetchRecentProducts(limit = 5): Promise<Product[]> {
  return fetchProducts(limit)
}

export async function fetchLowStockProducts(threshold = 10): Promise<Product[]> {
  try {
    const products = await fetchProducts(50)
    return products.filter((product) => product.variants.some((variant) => variant.inventoryQuantity <= threshold))
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return []
  }
}
