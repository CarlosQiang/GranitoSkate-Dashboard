// API para gestionar productos
export async function fetchProducts(limit = 50, cursor?: string) {
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
      cache: "no-store", // Siempre obtener datos frescos
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

export async function fetchProduct(id: string) {
  try {
    const response = await fetch(`/api/shopify/products/${id}`, {
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
    console.error("Error en fetchProduct:", error)
    throw error
  }
}

export async function createProduct(productData: any) {
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

export async function updateProduct(id: string, productData: any) {
  try {
    const response = await fetch(`/api/shopify/products/${id}`, {
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

export async function deleteProduct(id: string) {
  try {
    const response = await fetch(`/api/shopify/products/${id}`, {
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

    return result.data
  } catch (error) {
    console.error("Error en deleteProduct:", error)
    throw error
  }
}
