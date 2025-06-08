const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface PromocionData {
  titulo: string
  descripcion?: string
  tipo: string
  objetivo: string
  valor: string | number
  fechaInicio: string
  fechaFin?: string | null
  codigo?: string | null
  limitarUsos?: boolean
  limiteUsos?: number | null
  compraMinima?: number | null
}

export async function fetchPromociones(filter = "todas") {
  try {
    console.log(`🔍 Obteniendo promociones con filtro: ${filter}`)

    // Array para almacenar todas las promociones
    let todasPromociones = []

    // Intentar obtener de Shopify primero
    try {
      const shopifyResponse = await fetch(`/api/shopify/promotions?filter=${filter}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        if (shopifyData.success && Array.isArray(shopifyData.promociones)) {
          console.log(`✅ Promociones de Shopify: ${shopifyData.promociones.length}`)
          todasPromociones = [...shopifyData.promociones]
        }
      }
    } catch (shopifyError) {
      console.error("Error al obtener promociones de Shopify:", shopifyError)
    }

    // Obtener promociones de la base de datos local
    try {
      const dbResponse = await fetch(`/api/db/promociones?filter=${filter}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        if (Array.isArray(dbData) && dbData.length > 0) {
          console.log(`✅ Promociones de BD local: ${dbData.length}`)

          // Filtrar para no duplicar promociones que ya existen en Shopify
          const promocionesUnicas = dbData.filter((dbPromo) => {
            // Si tiene shopify_id, verificar que no esté ya en las promociones de Shopify
            if (dbPromo.shopify_id) {
              return !todasPromociones.some(
                (shopifyPromo) =>
                  shopifyPromo.id === dbPromo.shopify_id || shopifyPromo.shopify_id === dbPromo.shopify_id,
              )
            }
            return true // Si no tiene shopify_id, incluirla siempre
          })

          todasPromociones = [...todasPromociones, ...promocionesUnicas]
        }
      }
    } catch (dbError) {
      console.error("Error al obtener promociones de BD local:", dbError)
    }

    console.log(`✅ Total promociones combinadas: ${todasPromociones.length}`)
    return todasPromociones
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error)
    throw new Error("No se pudieron cargar las promociones. Intente nuevamente más tarde.")
  }
}

export async function fetchPromocionById(id: string) {
  try {
    console.log(`🔍 Obteniendo promoción por ID: ${id}`)

    // Intentar obtener de Shopify primero
    try {
      const shopifyResponse = await fetch(`/api/shopify/promotions/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        if (shopifyData.success && shopifyData.promocion) {
          console.log(`✅ Promoción encontrada en Shopify`)
          return shopifyData.promocion
        }
      }
    } catch (shopifyError) {
      console.error("Error al obtener promoción de Shopify:", shopifyError)
    }

    // Si Shopify falla, intentar base de datos local
    try {
      const dbResponse = await fetch(`/api/db/promociones/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        console.log(`✅ Promoción encontrada en BD local`)
        return dbData
      }
    } catch (dbError) {
      console.error("Error al obtener promoción de BD local:", dbError)
    }

    throw new Error("Promoción no encontrada")
  } catch (error) {
    console.error("❌ Error al obtener promoción:", error)
    throw error
  }
}

export async function crearPromocion(data: PromocionData) {
  try {
    console.log(`📝 Creando promoción:`, data)

    const response = await fetch(`/api/db/promociones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al crear promoción")
    }

    const result = await response.json()
    console.log(`✅ Promoción creada exitosamente:`, result)
    return result
  } catch (error) {
    console.error("❌ Error al crear promoción:", error)
    throw error
  }
}

export async function actualizarPromocion(id: string, data: Partial<PromocionData>) {
  try {
    console.log(`📝 Actualizando promoción ${id}:`, data)

    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al actualizar promoción")
    }

    const result = await response.json()
    console.log(`✅ Promoción actualizada exitosamente:`, result)
    return result
  } catch (error) {
    console.error("❌ Error al actualizar promoción:", error)
    throw error
  }
}

export async function eliminarPromocion(id: string) {
  try {
    console.log(`🗑️ Eliminando promoción ${id}`)

    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al eliminar promoción")
    }

    const result = await response.json()
    console.log(`✅ Promoción eliminada exitosamente`)
    return result
  } catch (error) {
    console.error("❌ Error al eliminar promoción:", error)
    throw error
  }
}

// Exportar alias para compatibilidad con código existente
export const obtenerPromociones = fetchPromociones
export const obtenerPromocionPorId = fetchPromocionById
export const createPromocion = crearPromocion
export const updatePromocion = actualizarPromocion
export const deletePromocion = eliminarPromocion
