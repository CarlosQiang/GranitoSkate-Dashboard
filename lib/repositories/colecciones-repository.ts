import db from "@/lib/db/vercel-postgres"
import { extractIdFromGid } from "@/lib/shopify-client"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "colecciones-repository",
})

/**
 * Guarda una colección de Shopify en la base de datos
 * @param coleccion Colección de Shopify
 * @returns Colección guardada
 */
export async function saveColeccionFromShopify(coleccion: any) {
  try {
    logger.debug(`Guardando colección de Shopify: ${coleccion.title}`)

    // Extraer el ID numérico de Shopify
    const shopifyId = extractIdFromGid(coleccion.id)

    // Verificar si la colección ya existe en la base de datos
    const existingCollection = await db.findByField("colecciones", "shopify_id", shopifyId)

    // Extraer la imagen
    const imageUrl = coleccion.image?.url || null

    // Preparar los datos de la colección
    const collectionData = {
      shopify_id: shopifyId,
      titulo: coleccion.title,
      descripcion: coleccion.description || null,
      imagen_url: imageUrl,
      handle: coleccion.handle || null,
      fecha_actualizacion: new Date(),
      metadatos: JSON.stringify({
        productsCount: coleccion.productsCount || 0,
        products:
          coleccion.products?.edges?.map((edge: any) => ({
            id: edge.node.id,
            title: edge.node.title,
          })) || [],
        metafields: coleccion.metafields?.edges?.map((edge: any) => edge.node) || [],
      }),
    }

    // Si la colección ya existe, actualizarla
    if (existingCollection) {
      logger.debug(`Actualizando colección existente: ${existingCollection.id}`)
      const updatedCollection = await db.update("colecciones", existingCollection.id, collectionData)

      // Registrar el evento de sincronización
      await db.logSyncEvent(
        "colecciones",
        shopifyId,
        "actualizar",
        "exito",
        `Colección actualizada: ${coleccion.title}`,
        { id: updatedCollection.id },
      )

      return updatedCollection
    }

    // Si la colección no existe, crearla
    logger.debug(`Creando nueva colección: ${coleccion.title}`)
    const newCollection = await db.insert("colecciones", {
      ...collectionData,
      fecha_creacion: new Date(),
    })

    // Registrar el evento de sincronización
    await db.logSyncEvent("colecciones", shopifyId, "crear", "exito", `Colección creada: ${coleccion.title}`, {
      id: newCollection.id,
    })

    return newCollection
  } catch (error) {
    logger.error(`Error al guardar colección de Shopify: ${coleccion.title}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
      coleccion: coleccion.id,
    })

    // Registrar el evento de sincronización
    await db.logSyncEvent(
      "colecciones",
      extractIdFromGid(coleccion.id),
      "guardar",
      "error",
      `Error al guardar colección: ${error instanceof Error ? error.message : "Error desconocido"}`,
      { coleccion: coleccion.title },
    )

    throw error
  }
}

/**
 * Obtiene todas las colecciones de la base de datos
 * @returns Array de colecciones
 */
export async function getAllCollections() {
  try {
    return await db.findAll("colecciones")
  } catch (error) {
    logger.error("Error al obtener todas las colecciones", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Obtiene una colección por ID
 * @param id ID de la colección
 * @returns Colección
 */
export async function getCollectionById(id: number) {
  try {
    return await db.findById("colecciones", id)
  } catch (error) {
    logger.error(`Error al obtener colección con ID ${id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Obtiene una colección por ID de Shopify
 * @param shopifyId ID de Shopify
 * @returns Colección
 */
export async function getCollectionByShopifyId(shopifyId: string) {
  try {
    return await db.findByField("colecciones", "shopify_id", shopifyId)
  } catch (error) {
    logger.error(`Error al obtener colección con Shopify ID ${shopifyId}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Actualiza una colección
 * @param id ID de la colección
 * @param data Datos de la colección
 * @returns Colección actualizada
 */
export async function updateCollection(id: number, data: any) {
  try {
    return await db.update("colecciones", id, {
      ...data,
      fecha_actualizacion: new Date(),
    })
  } catch (error) {
    logger.error(`Error al actualizar colección con ID ${id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

/**
 * Elimina una colección
 * @param id ID de la colección
 * @returns Resultado de la eliminación
 */
export async function deleteCollection(id: number) {
  try {
    return await db.remove("colecciones", id)
  } catch (error) {
    logger.error(`Error al eliminar colección con ID ${id}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}
