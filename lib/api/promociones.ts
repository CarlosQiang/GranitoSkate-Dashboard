// Función para obtener todas las promociones
export async function obtenerPromociones(filtro = "todas") {
  try {
    console.log(`🔍 Obteniendo promociones con filtro: ${filtro}...`)

    // Primero intentamos obtener las promociones de la base de datos local
    const dbResponse = await fetch("/api/db/promociones", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (dbResponse.ok) {
      const dbData = await dbResponse.json()
      console.log(`✅ Promociones obtenidas de BD: ${dbData.length || 0}`)

      // Si hay promociones en la base de datos, las devolvemos filtradas
      if (dbData && dbData.length > 0) {
        return filtrarPromociones(dbData, filtro)
      }
    } else {
      console.warn(`⚠️ Error al obtener promociones de BD: ${dbResponse.status}`)
    }

    // Si no hay promociones en la base de datos, las obtenemos directamente de Shopify
    console.log("🔄 Intentando obtener promociones de Shopify...")
    const shopifyResponse = await fetch("/api/shopify/promotions", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text()
      console.error(`❌ Error al obtener promociones de Shopify: ${shopifyResponse.status}`, errorText)

      // Intentar con REST API directamente
      console.log("🔄 Intentando con REST API directamente...")
      const restResponse = await fetch("/api/shopify/promotions/rest", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (restResponse.ok) {
        const restData = await restResponse.json()
        if (restData.success && restData.promociones) {
          console.log(`✅ Promociones obtenidas via REST: ${restData.promociones.length}`)
          return filtrarPromociones(restData.promociones, filtro)
        }
      }

      // Si todo falla, devolver array vacío
      return []
    }

    const shopifyData = await shopifyResponse.json()

    if (shopifyData.success && shopifyData.promociones && shopifyData.promociones.length > 0) {
      console.log(`✅ Promociones obtenidas de Shopify: ${shopifyData.promociones.length}`)
      return filtrarPromociones(shopifyData.promociones, filtro)
    }

    // Si llegamos aquí, no hay promociones disponibles
    console.log("⚠️ No se encontraron promociones en ninguna fuente")
    return []
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error)

    // Como último recurso, intentar obtener de la base de datos sin cache
    try {
      const fallbackResponse = await fetch("/api/db/promociones", {
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        console.log(`🔄 Fallback: promociones de BD: ${fallbackData.length || 0}`)
        return filtrarPromociones(fallbackData || [], filtro)
      }
    } catch (fallbackError) {
      console.error("❌ Error en fallback:", fallbackError)
    }

    throw new Error("No se pudieron obtener las promociones. Por favor, inténtalo de nuevo.")
  }
}

// Función para filtrar promociones según el filtro seleccionado
function filtrarPromociones(promociones, filtro) {
  const ahora = new Date()

  switch (filtro) {
    case "activas":
      return promociones.filter((promo) => {
        const fechaInicio = promo.fecha_inicio ? new Date(promo.fecha_inicio) : null
        const fechaFin = promo.fecha_fin ? new Date(promo.fecha_fin) : null

        return promo.activa && (!fechaInicio || fechaInicio <= ahora) && (!fechaFin || fechaFin >= ahora)
      })
    case "programadas":
      return promociones.filter((promo) => {
        const fechaInicio = promo.fecha_inicio ? new Date(promo.fecha_inicio) : null
        return fechaInicio && fechaInicio > ahora
      })
    case "expiradas":
      return promociones.filter((promo) => {
        const fechaFin = promo.fecha_fin ? new Date(promo.fecha_fin) : null
        return (fechaFin && fechaFin < ahora) || !promo.activa
      })
    case "todas":
    default:
      return promociones
  }
}

// Función para obtener una promoción por ID
export async function obtenerPromocionPorId(id: string) {
  try {
    console.log(`🔍 Obteniendo promoción con ID ${id}...`)

    const response = await fetch(`/api/db/promociones/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error al obtener promoción: ${response.status}`)
    }

    const data = await response.json()

    if (data) {
      console.log(`✅ Promoción encontrada: ${data.titulo || id}`)
      return data
    }

    throw new Error(`No se encontró promoción con ID ${id}`)
  } catch (error) {
    console.error(`❌ Error obteniendo promoción con ID ${id}:`, error)
    throw error
  }
}

// Función para crear una promoción
export async function crearPromocion(datos: any) {
  try {
    console.log("🔍 Creando nueva promoción...", datos)

    // Validar datos mínimos
    if (!datos.titulo) {
      throw new Error("El título de la promoción es obligatorio")
    }

    const response = await fetch("/api/db/promociones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error al crear promoción: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Promoción creada: ${data.titulo || "Sin título"}`)
    return data
  } catch (error) {
    console.error("❌ Error creando promoción:", error)
    throw error
  }
}

// Función para actualizar una promoción
export async function actualizarPromocion(id: string, datos: any) {
  try {
    console.log(`🔍 Actualizando promoción con ID ${id}...`, datos)

    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error al actualizar promoción: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Promoción actualizada: ${data.titulo || id}`)
    return data
  } catch (error) {
    console.error(`❌ Error actualizando promoción con ID ${id}:`, error)
    throw error
  }
}

// Función para eliminar una promoción
export async function eliminarPromocion(id: string) {
  try {
    console.log(`🔍 Eliminando promoción con ID ${id}...`)

    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error al eliminar promoción: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Promoción eliminada: ${id}`)
    return data
  } catch (error) {
    console.error(`❌ Error eliminando promoción con ID ${id}:`, error)
    throw error
  }
}

// Mantener los alias existentes para compatibilidad
export const fetchPromociones = obtenerPromociones
export const fetchPriceListById = obtenerPromocionPorId
export const updatePriceList = actualizarPromocion
export const deletePriceList = eliminarPromocion
