import { executeQuery, findAll, findById, insert, update, remove, logSyncEvent } from "../neon"

export async function getAllTutoriales() {
  return findAll("tutoriales")
}

export async function getTutorialById(id: number) {
  const tutoriales = await findById("tutoriales", id)
  return tutoriales.length > 0 ? tutoriales[0] : null
}

export async function getTutorialBySlug(slug: string) {
  const query = "SELECT * FROM tutoriales WHERE slug = $1"
  const result = await executeQuery(query, [slug])
  return result.length > 0 ? result[0] : null
}

export async function getTutorialByShopifyId(shopifyId: string) {
  const query = "SELECT * FROM tutoriales WHERE shopify_id = $1"
  const result = await executeQuery(query, [shopifyId])
  return result.length > 0 ? result[0] : null
}

export async function createTutorial(data: any) {
  try {
    const tutorial = await insert("tutoriales", {
      ...data,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    })

    await logSyncEvent(
      "TUTORIAL",
      tutorial.id.toString(),
      "CREATE",
      "SUCCESS",
      "Tutorial creado correctamente",
      tutorial,
    )

    return tutorial
  } catch (error) {
    await logSyncEvent("TUTORIAL", "unknown", "CREATE", "ERROR", `Error al crear tutorial: ${error.message}`, {
      error: error.message,
      data,
    })
    throw error
  }
}

export async function updateTutorial(id: number, data: any) {
  try {
    const tutorial = await update("tutoriales", id, {
      ...data,
      fecha_actualizacion: new Date(),
    })

    await logSyncEvent("TUTORIAL", id.toString(), "UPDATE", "SUCCESS", "Tutorial actualizado correctamente", tutorial)

    return tutorial
  } catch (error) {
    await logSyncEvent("TUTORIAL", id.toString(), "UPDATE", "ERROR", `Error al actualizar tutorial: ${error.message}`, {
      error: error.message,
      data,
    })
    throw error
  }
}

export async function deleteTutorial(id: number) {
  try {
    await remove("tutoriales", id)

    await logSyncEvent("TUTORIAL", id.toString(), "DELETE", "SUCCESS", "Tutorial eliminado correctamente")

    return { success: true }
  } catch (error) {
    await logSyncEvent("TUTORIAL", id.toString(), "DELETE", "ERROR", `Error al eliminar tutorial: ${error.message}`, {
      error: error.message,
    })
    throw error
  }
}

export async function syncTutorialWithShopify(id: number, shopifyData: any) {
  try {
    const tutorial = await getTutorialById(id)

    if (!tutorial) {
      throw new Error(`Tutorial con ID ${id} no encontrado`)
    }

    const updatedTutorial = await update("tutoriales", id, {
      shopify_id: shopifyData.id,
      ultima_sincronizacion: new Date(),
    })

    await logSyncEvent("TUTORIAL", id.toString(), "SYNC", "SUCCESS", "Tutorial sincronizado con Shopify", {
      shopifyId: shopifyData.id,
    })

    return updatedTutorial
  } catch (error) {
    await logSyncEvent("TUTORIAL", id.toString(), "SYNC", "ERROR", `Error al sincronizar tutorial: ${error.message}`, {
      error: error.message,
    })
    throw error
  }
}
