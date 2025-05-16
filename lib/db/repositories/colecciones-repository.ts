import { sql } from "@vercel/postgres"
import type { Coleccion, ProductoColeccion } from "../schema"
import { logSyncEvent } from "./registro-repository"

// Obtener todas las colecciones
export async function getAllColecciones(): Promise<Coleccion[]> {
  try {
    const result = await sql`
      SELECT * FROM colecciones
      ORDER BY fecha_creacion DESC
    `
    return result.rows
  } catch (error) {
    console.error("Error al obtener colecciones:", error)
    throw error
  }
}

// Obtener una colección por ID
export async function getColeccionById(id: number): Promise<Coleccion | null> {
  try {
    const result = await sql`
      SELECT * FROM colecciones
      WHERE id = ${id}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener colección con ID ${id}:`, error)
    throw error
  }
}

// Obtener una colección por Shopify ID
export async function getColeccionByShopifyId(shopifyId: string): Promise<Coleccion | null> {
  try {
    const result = await sql`
      SELECT * FROM colecciones
      WHERE shopify_id = ${shopifyId}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener colección con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

// Crear una nueva colección
export async function createColeccion(data: Partial<Coleccion>): Promise<Coleccion> {
  try {
    const {
      shopify_id,
      titulo,
      descripcion,
      url_handle,
      imagen_url,
      es_automatica = false,
      condiciones_automaticas,
      publicada = false,
      seo_titulo,
      seo_descripcion,
      fecha_publicacion,
    } = data

    const result = await sql`
      INSERT INTO colecciones (
        shopify_id, titulo, descripcion, url_handle, imagen_url,
        es_automatica, condiciones_automaticas, publicada, seo_titulo,
        seo_descripcion, fecha_creacion, fecha_actualizacion, fecha_publicacion
      )
      VALUES (
        ${shopify_id || null}, ${titulo}, ${descripcion || null}, ${url_handle || null},
        ${imagen_url || null}, ${es_automatica}, ${condiciones_automaticas ? JSON.stringify(condiciones_automaticas) : null},
        ${publicada}, ${seo_titulo || null}, ${seo_descripcion || null},
        NOW(), NOW(), ${fecha_publicacion || null}
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear colección:", error)
    throw error
  }
}

// Actualizar una colección existente
export async function updateColeccion(id: number, data: Partial<Coleccion>): Promise<Coleccion> {
  try {
    // Primero obtenemos la colección actual
    const currentColeccion = await getColeccionById(id)
    if (!currentColeccion) {
      throw new Error(`Colección con ID ${id} no encontrada`)
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentColeccion,
      ...data,
      fecha_actualizacion: new Date(),
    }

    const {
      shopify_id,
      titulo,
      descripcion,
      url_handle,
      imagen_url,
      es_automatica,
      condiciones_automaticas,
      publicada,
      seo_titulo,
      seo_descripcion,
      fecha_publicacion,
      ultima_sincronizacion,
    } = updatedData

    const result = await sql`
      UPDATE colecciones
      SET
        shopify_id = ${shopify_id || null},
        titulo = ${titulo},
        descripcion = ${descripcion || null},
        url_handle = ${url_handle || null},
        imagen_url = ${imagen_url || null},
        es_automatica = ${es_automatica},
        condiciones_automaticas = ${condiciones_automaticas ? JSON.stringify(condiciones_automaticas) : null},
        publicada = ${publicada},
        seo_titulo = ${seo_titulo || null},
        seo_descripcion = ${seo_descripcion || null},
        fecha_actualizacion = NOW(),
        fecha_publicacion = ${fecha_publicacion || null},
        ultima_sincronizacion = ${ultima_sincronizacion || null}
      WHERE id = ${id}
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar colección con ID ${id}:`, error)
    throw error
  }
}

// Eliminar una colección
export async function deleteColeccion(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM colecciones
      WHERE id = ${id}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar colección con ID ${id}:`, error)
    throw error
  }
}

// Buscar colecciones
export async function searchColecciones(
  query: string,
  limit = 10,
  offset = 0,
): Promise<{ colecciones: Coleccion[]; total: number }> {
  try {
    const searchQuery = `%${query}%`

    const coleccionesResult = await sql`
      SELECT * FROM colecciones
      WHERE 
        titulo ILIKE ${searchQuery} OR
        descripcion ILIKE ${searchQuery}
      ORDER BY fecha_creacion DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM colecciones
      WHERE 
        titulo ILIKE ${searchQuery} OR
        descripcion ILIKE ${searchQuery}
    `

    return {
      colecciones: coleccionesResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al buscar colecciones con query "${query}":`, error)
    throw error
  }
}

// Obtener productos de una colección
export async function getProductosByColeccionId(coleccionId: number): Promise<any[]> {
  try {
    const result = await sql`
      SELECT p.* FROM productos p
      JOIN productos_colecciones pc ON p.id = pc.producto_id
      WHERE pc.coleccion_id = ${coleccionId}
      ORDER BY pc.posicion ASC, p.titulo ASC
    `

    return result.rows
  } catch (error) {
    console.error(`Error al obtener productos de la colección con ID ${coleccionId}:`, error)
    throw error
  }
}

// Añadir un producto a una colección
export async function addProductoToColeccion(
  productoId: number,
  coleccionId: number,
  posicion?: number,
): Promise<ProductoColeccion> {
  try {
    // Verificar si ya existe la relación
    const existingRelation = await sql`
      SELECT * FROM productos_colecciones
      WHERE producto_id = ${productoId} AND coleccion_id = ${coleccionId}
    `

    if (existingRelation.rows.length > 0) {
      // Actualizar posición si es necesario
      if (posicion !== undefined) {
        const result = await sql`
          UPDATE productos_colecciones
          SET posicion = ${posicion}, fecha_actualizacion = NOW()
          WHERE producto_id = ${productoId} AND coleccion_id = ${coleccionId}
          RETURNING *
        `
        return result.rows[0]
      }
      return existingRelation.rows[0]
    }

    // Crear nueva relación
    const result = await sql`
      INSERT INTO productos_colecciones (
        producto_id, coleccion_id, posicion, fecha_creacion, fecha_actualizacion
      )
      VALUES (
        ${productoId}, ${coleccionId}, ${posicion || null}, NOW(), NOW()
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error(`Error al añadir producto ${productoId} a la colección ${coleccionId}:`, error)
    throw error
  }
}

// Eliminar un producto de una colección
export async function removeProductoFromColeccion(productoId: number, coleccionId: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM productos_colecciones
      WHERE producto_id = ${productoId} AND coleccion_id = ${coleccionId}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar producto ${productoId} de la colección ${coleccionId}:`, error)
    throw error
  }
}

// Sincronizar una colección con Shopify
export async function syncColeccionWithShopify(collection: any): Promise<number> {
  try {
    // Verificar si la colección ya existe
    const existingCollection = await getColeccionByShopifyId(collection.id)

    if (existingCollection) {
      // Actualizar colección existente
      const updatedCollection = await updateColeccion(existingCollection.id, {
        titulo: collection.title,
        descripcion: collection.description || collection.descriptionHtml,
        url_handle: collection.handle,
        imagen_url: collection.image?.url,
        publicada: true, // Asumimos que si viene de Shopify está publicada
        seo_titulo: collection.seo?.title || collection.title,
        seo_descripcion: collection.seo?.description || collection.description?.substring(0, 160),
        ultima_sincronizacion: new Date(),
      })

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "COLLECTION",
        entidad_id: collection.id,
        accion: "UPDATE",
        resultado: "SUCCESS",
        mensaje: `Colección actualizada: ${collection.title}`,
      })

      return updatedCollection.id
    } else {
      // Crear nueva colección
      const newCollection = await createColeccion({
        shopify_id: collection.id,
        titulo: collection.title,
        descripcion: collection.description || collection.descriptionHtml,
        url_handle: collection.handle,
        imagen_url: collection.image?.url,
        publicada: true, // Asumimos que si viene de Shopify está publicada
        seo_titulo: collection.seo?.title || collection.title,
        seo_descripcion: collection.seo?.description || collection.description?.substring(0, 160),
        ultima_sincronizacion: new Date(),
      })

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "COLLECTION",
        entidad_id: collection.id,
        accion: "CREATE",
        resultado: "SUCCESS",
        mensaje: `Colección creada: ${collection.title}`,
      })

      return newCollection.id
    }
  } catch (error) {
    console.error(`Error al sincronizar colección ${collection.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "COLLECTION",
      entidad_id: collection.id,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar colección: ${(error as Error).message}`,
    })

    throw error
  }
}

// Sincronizar productos de una colección
export async function syncProductosColeccion(
  coleccionId: number,
  shopifyColeccionId: string,
  productIds: string[],
): Promise<void> {
  try {
    // Eliminar relaciones existentes
    await sql`DELETE FROM productos_colecciones WHERE coleccion_id = ${coleccionId}`

    // Si no hay productos, terminar
    if (!productIds.length) {
      return
    }

    // Insertar nuevas relaciones
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i]

      // Buscar el ID de la base de datos para el producto
      const productResult = await sql`
        SELECT id FROM productos WHERE shopify_id = ${productId}
      `

      if (productResult.rows.length > 0) {
        const productDbId = productResult.rows[0].id

        // Insertar relación
        await sql`
          INSERT INTO productos_colecciones (
            producto_id, coleccion_id, posicion, fecha_creacion, fecha_actualizacion
          )
          VALUES (
            ${productDbId}, ${coleccionId}, ${i + 1}, NOW(), NOW()
          )
        `
      }
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "COLLECTION_PRODUCTS",
      entidad_id: shopifyColeccionId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Productos de colección sincronizados: ${productIds.length} productos`,
    })
  } catch (error) {
    console.error(`Error al sincronizar productos de colección ${shopifyColeccionId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "COLLECTION_PRODUCTS",
      entidad_id: shopifyColeccionId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar productos de colección: ${(error as Error).message}`,
    })

    throw error
  }
}
