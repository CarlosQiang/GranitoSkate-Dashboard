import { sql } from "@vercel/postgres"
import type { Promocion } from "../schema"

// Obtener todas las promociones
export async function getAllPromociones(): Promise<Promocion[]> {
  try {
    const result = await sql.query(`
      SELECT * FROM promociones
      ORDER BY fecha_creacion DESC
    `)
    return result.rows
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    throw error
  }
}

// Obtener una promoción por ID
export async function getPromocionById(id: number): Promise<Promocion | null> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM promociones
      WHERE id = $1
    `,
      [id],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener promoción con ID ${id}:`, error)
    throw error
  }
}

// Obtener una promoción por Shopify ID
export async function getPromocionByShopifyId(shopifyId: string): Promise<Promocion | null> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM promociones
      WHERE shopify_id = $1
    `,
      [shopifyId],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener promoción con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

// Crear una nueva promoción
export async function createPromocion(data: Partial<Promocion>): Promise<Promocion> {
  try {
    const {
      shopify_id,
      titulo,
      descripcion,
      tipo,
      valor,
      codigo,
      objetivo,
      objetivo_id,
      condiciones,
      fecha_inicio,
      fecha_fin,
      activa = false,
      limite_uso,
      contador_uso = 0,
      es_automatica = false,
    } = data

    const result = await sql.query(
      `
      INSERT INTO promociones (
        shopify_id, titulo, descripcion, tipo, valor, codigo, objetivo,
        objetivo_id, condiciones, fecha_inicio, fecha_fin, activa,
        limite_uso, contador_uso, es_automatica, fecha_creacion, fecha_actualizacion
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
      )
      RETURNING *
    `,
      [
        shopify_id || null,
        titulo,
        descripcion || null,
        tipo,
        valor || null,
        codigo || null,
        objetivo || null,
        objetivo_id || null,
        condiciones ? JSON.stringify(condiciones) : null,
        fecha_inicio || null,
        fecha_fin || null,
        activa,
        limite_uso || null,
        contador_uso,
        es_automatica,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw error
  }
}

// Actualizar una promoción existente
export async function updatePromocion(id: number, data: Partial<Promocion>): Promise<Promocion> {
  try {
    // Primero obtenemos la promoción actual
    const currentPromocion = await getPromocionById(id)
    if (!currentPromocion) {
      throw new Error(`Promoción con ID ${id} no encontrada`)
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentPromocion,
      ...data,
      fecha_actualizacion: new Date(),
    }

    const {
      shopify_id,
      titulo,
      descripcion,
      tipo,
      valor,
      codigo,
      objetivo,
      objetivo_id,
      condiciones,
      fecha_inicio,
      fecha_fin,
      activa,
      limite_uso,
      contador_uso,
      es_automatica,
      ultima_sincronizacion,
    } = updatedData

    const result = await sql.query(
      `
      UPDATE promociones
      SET
        shopify_id = $1,
        titulo = $2,
        descripcion = $3,
        tipo = $4,
        valor = $5,
        codigo = $6,
        objetivo = $7,
        objetivo_id = $8,
        condiciones = $9,
        fecha_inicio = $10,
        fecha_fin = $11,
        activa = $12,
        limite_uso = $13,
        contador_uso = $14,
        es_automatica = $15,
        fecha_actualizacion = NOW(),
        ultima_sincronizacion = $16
      WHERE id = $17
      RETURNING *
    `,
      [
        shopify_id || null,
        titulo,
        descripcion || null,
        tipo,
        valor || null,
        codigo || null,
        objetivo || null,
        objetivo_id || null,
        condiciones ? JSON.stringify(condiciones) : null,
        fecha_inicio || null,
        fecha_fin || null,
        activa,
        limite_uso || null,
        contador_uso,
        es_automatica,
        ultima_sincronizacion || null,
        id,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar promoción con ID ${id}:`, error)
    throw error
  }
}

// Eliminar una promoción
export async function deletePromocion(id: number): Promise<boolean> {
  try {
    const result = await sql.query(
      `
      DELETE FROM promociones
      WHERE id = $1
      RETURNING id
    `,
      [id],
    )

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar promoción con ID ${id}:`, error)
    throw error
  }
}

// Buscar promociones
export async function searchPromociones(
  query: string,
  limit = 10,
  offset = 0,
): Promise<{ promociones: Promocion[]; total: number }> {
  try {
    const searchQuery = `%${query}%`

    const promocionesResult = await sql.query(
      `
      SELECT * FROM promociones
      WHERE 
        titulo ILIKE $1 OR
        descripcion ILIKE $1 OR
        codigo ILIKE $1
      ORDER BY fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `,
      [searchQuery, limit, offset],
    )

    const countResult = await sql.query(
      `
      SELECT COUNT(*) as total FROM promociones
      WHERE 
        titulo ILIKE $1 OR
        descripcion ILIKE $1 OR
        codigo ILIKE $1
    `,
      [searchQuery],
    )

    return {
      promociones: promocionesResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al buscar promociones con query "${query}":`, error)
    throw error
  }
}

// Sincronizar una promoción con Shopify
export async function syncPromocionWithShopify(shopifyPromocion: any): Promise<Promocion> {
  try {
    // Buscar si la promoción ya existe
    const existingPromocion = await getPromocionByShopifyId(shopifyPromocion.id)

    if (existingPromocion) {
      // Actualizar promoción existente
      return updatePromocion(existingPromocion.id, {
        titulo: shopifyPromocion.title,
        descripcion: shopifyPromocion.summary,
        tipo: shopifyPromocion.valueType === "percentage" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
        valor: shopifyPromocion.value,
        codigo: shopifyPromocion.code,
        objetivo: shopifyPromocion.target || "CART",
        objetivo_id: shopifyPromocion.targetId,
        fecha_inicio: shopifyPromocion.startsAt ? new Date(shopifyPromocion.startsAt) : null,
        fecha_fin: shopifyPromocion.endsAt ? new Date(shopifyPromocion.endsAt) : null,
        activa: shopifyPromocion.status === "ACTIVE",
        limite_uso: shopifyPromocion.usageLimit,
        contador_uso: shopifyPromocion.usageCount || 0,
        es_automatica: shopifyPromocion.isAutomatic || false,
        ultima_sincronizacion: new Date(),
      })
    } else {
      // Crear nueva promoción
      return createPromocion({
        shopify_id: shopifyPromocion.id,
        titulo: shopifyPromocion.title,
        descripcion: shopifyPromocion.summary,
        tipo: shopifyPromocion.valueType === "percentage" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
        valor: shopifyPromocion.value,
        codigo: shopifyPromocion.code,
        objetivo: shopifyPromocion.target || "CART",
        objetivo_id: shopifyPromocion.targetId,
        fecha_inicio: shopifyPromocion.startsAt ? new Date(shopifyPromocion.startsAt) : null,
        fecha_fin: shopifyPromocion.endsAt ? new Date(shopifyPromocion.endsAt) : null,
        activa: shopifyPromocion.status === "ACTIVE",
        limite_uso: shopifyPromocion.usageLimit,
        contador_uso: shopifyPromocion.usageCount || 0,
        es_automatica: shopifyPromocion.isAutomatic || false,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
        ultima_sincronizacion: new Date(),
      })
    }
  } catch (error) {
    console.error(`Error al sincronizar promoción con Shopify ID ${shopifyPromocion.id}:`, error)
    throw error
  }
}
