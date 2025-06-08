/**
 * Obtiene las promociones desde la API
 * @param filter Filtro opcional (todas, activas, programadas, expiradas)
 * @returns Array de promociones
 */
export async function fetchPromociones(filter = "todas"): Promise<any[]> {
  try {
    console.log("🔍 Obteniendo promociones con filtro:", filter)

    // Primero intentar con Shopify GraphQL
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
        return shopifyData.promociones
      }
    }

    // Fallback: intentar con REST API
    console.log("⚠️ Intentando con REST API...")
    const restResponse = await fetch(`/api/shopify/promotions/rest?filter=${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (restResponse.ok) {
      const restData = await restResponse.json()
      if (restData.success && Array.isArray(restData.promociones)) {
        console.log(`✅ Promociones REST: ${restData.promociones.length}`)
        return restData.promociones
      }
    }

    // Último fallback: base de datos local
    console.log("⚠️ Intentando con base de datos local...")
    const dbResponse = await fetch(`/api/db/promociones?filter=${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (dbResponse.ok) {
      const dbData = await dbResponse.json()
      if (Array.isArray(dbData)) {
        console.log(`✅ Promociones DB: ${dbData.length}`)
        return dbData
      }
    }

    console.log("⚠️ No se encontraron promociones")
    return []
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error)
    throw new Error("No se pudieron cargar las promociones. Intente nuevamente más tarde.")
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción
 */
export async function fetchPromocionById(id: string): Promise<any> {
  try {
    // Usar ruta relativa para evitar problemas de CORS
    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error al obtener promoción: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al obtener promoción:", error)
    throw error
  }
}

/**
 * Crea una nueva promoción
 * @param promocionData Datos de la promoción
 * @returns Promoción creada
 */
export async function createPromocion(promocionData: any): Promise<any> {
  try {
    // Usar ruta relativa para evitar problemas de CORS
    const response = await fetch(`/api/db/promociones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promocionData),
    })

    if (!response.ok) {
      throw new Error(`Error al crear promoción: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw error
  }
}

/**
 * Actualiza una promoción existente
 * @param id ID de la promoción
 * @param promocionData Datos actualizados
 * @returns Promoción actualizada
 */
export async function updatePromocion(id: string, promocionData: any): Promise<any> {
  try {
    // Usar ruta relativa para evitar problemas de CORS
    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promocionData),
    })

    if (!response.ok) {
      throw new Error(`Error al actualizar promoción: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al actualizar promoción:", error)
    throw error
  }
}

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns Resultado de la operación
 */
export async function deletePromocion(id: string): Promise<any> {
  try {
    // Usar ruta relativa para evitar problemas de CORS
    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error al eliminar promoción: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al eliminar promoción:", error)
    throw error
  }
}

// Exportar alias para compatibilidad con código existente
export const obtenerPromociones = fetchPromociones
export const obtenerPromocionPorId = fetchPromocionById
export const crearPromocion = createPromocion
export const actualizarPromocion = updatePromocion
export const eliminarPromocion = deletePromocion
