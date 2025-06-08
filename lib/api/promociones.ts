/**
 * Obtiene las promociones desde la API
 * @param filter Filtro opcional (todas, activas, programadas, expiradas)
 * @returns Array de promociones
 */
export async function fetchPromociones(filter = "todas"): Promise<any[]> {
  try {
    // Intentar primero con la API de Shopify
    console.log("Obteniendo promociones con filtro:", filter)

    // Usar ruta relativa para evitar problemas de CORS
    const shopifyResponse = await fetch(`/api/shopify/promotions?filter=${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!shopifyResponse.ok) {
      throw new Error(`Error al obtener promociones de Shopify: ${shopifyResponse.statusText}`)
    }

    const data = await shopifyResponse.json()
    return data
  } catch (shopifyError) {
    console.error("Error al obtener promociones de Shopify:", shopifyError)

    try {
      // Fallback: intentar con la base de datos local
      console.log("Intentando obtener promociones desde la base de datos local")

      // Usar ruta relativa para evitar problemas de CORS
      const dbResponse = await fetch(`/api/db/promociones?filter=${filter}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!dbResponse.ok) {
        throw new Error(`Error al obtener promociones de la base de datos: ${dbResponse.statusText}`)
      }

      const data = await dbResponse.json()
      return data
    } catch (dbError) {
      console.error("Error al obtener promociones de la base de datos:", dbError)
      throw new Error("No se pudieron cargar las promociones. Intente nuevamente más tarde.")
    }
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
