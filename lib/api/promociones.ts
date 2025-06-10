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
  productosSeleccionados?: string[]
  coleccionesSeleccionadas?: string[]
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
        console.log("📊 Respuesta completa de Shopify:", shopifyData)

        // Manejar diferentes estructuras de respuesta
        if (shopifyData.success && Array.isArray(shopifyData.promociones)) {
          console.log(`✅ Promociones de Shopify (success): ${shopifyData.promociones.length}`)
          todasPromociones = shopifyData.promociones.map((promo: any) => ({
            ...promo,
            esShopify: true,
          }))
        } else if (Array.isArray(shopifyData)) {
          console.log(`✅ Promociones de Shopify (array directo): ${shopifyData.length}`)
          todasPromociones = shopifyData.map((promo: any) => ({
            ...promo,
            esShopify: true,
          }))
        } else if (shopifyData.data && Array.isArray(shopifyData.data)) {
          console.log(`✅ Promociones de Shopify (data): ${shopifyData.data.length}`)
          todasPromociones = shopifyData.data.map((promo: any) => ({
            ...promo,
            esShopify: true,
          }))
        }
      } else {
        console.error(`❌ Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
        const errorText = await shopifyResponse.text()
        console.error(errorText)
      }
    } catch (shopifyError) {
      console.error("Error al obtener promociones de Shopify:", shopifyError)
    }

    // Si no hay promociones de Shopify, obtener de la base de datos local
    if (todasPromociones.length === 0) {
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
            todasPromociones = dbData
          }
        }
      } catch (dbError) {
        console.error("Error al obtener promociones de BD local:", dbError)
      }
    }

    console.log(`✅ Total promociones obtenidas: ${todasPromociones.length}`)
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

    // Intentar crear en Shopify primero
    try {
      const shopifyResponse = await fetch(`/api/shopify/promotions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        if (shopifyData.success) {
          console.log(`✅ Promoción creada en Shopify:`, shopifyData.promocion)
          return shopifyData.promocion
        }
      }
    } catch (shopifyError) {
      console.error("Error al crear promoción en Shopify:", shopifyError)
    }

    // Si Shopify falla, crear localmente
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

    // Intentar actualizar en Shopify con mejor manejo de errores
    try {
      const shopifyResponse = await fetch(`/api/shopify/promotions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log(`📊 Status de respuesta Shopify: ${shopifyResponse.status}`)

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        if (shopifyData.success) {
          console.log(`✅ Promoción actualizada en Shopify:`, shopifyData.promocion)
          return shopifyData.promocion
        } else {
          console.error("❌ Shopify respondió con éxito pero sin success:", shopifyData)
          throw new Error(shopifyData.error || "Error desconocido de Shopify")
        }
      } else {
        // Leer el error del servidor
        const errorText = await shopifyResponse.text()
        console.error(`❌ Error HTTP ${shopifyResponse.status}:`, errorText)
        throw new Error(`Error HTTP ${shopifyResponse.status}: ${errorText}`)
      }
    } catch (shopifyError) {
      console.error("❌ Error completo al actualizar en Shopify:", shopifyError)

      // Si es un error de red o servidor, intentar con BD local
      if (shopifyError instanceof TypeError || (shopifyError as any).message?.includes("fetch")) {
        console.log("🔄 Intentando actualizar solo en BD local...")

        try {
          const response = await fetch(`/api/db/promociones/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Error al actualizar promoción en BD local")
          }

          const result = await response.json()
          console.log(`✅ Promoción actualizada solo en BD local:`, result)
          return result
        } catch (dbError) {
          console.error("❌ Error también en BD local:", dbError)
          throw new Error("Error al actualizar promoción en Shopify y BD local")
        }
      } else {
        // Re-lanzar el error original si no es de red
        throw shopifyError
      }
    }
  } catch (error) {
    console.error("❌ Error final al actualizar promoción:", error)
    throw error
  }
}

export async function eliminarPromocion(id: string) {
  try {
    console.log(`🗑️ Eliminando promoción ${id}`)

    // Intentar eliminar de Shopify primero
    try {
      const shopifyResponse = await fetch(`/api/shopify/promotions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        if (shopifyData.success) {
          console.log(`✅ Promoción eliminada de Shopify`)
          return shopifyData
        }
      }
    } catch (shopifyError) {
      console.error("Error al eliminar promoción de Shopify:", shopifyError)
    }

    // Si Shopify falla, eliminar localmente
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
