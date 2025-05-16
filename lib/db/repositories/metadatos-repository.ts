import { sql } from "@vercel/postgres"
import type { Metadato } from "../schema"
import { logSyncEvent } from "./registro-repository"

// Obtener metadatos por tipo de propietario y ID
export async function getMetadatosByPropietario(tipoPropietario: string, propietarioId: number): Promise<Metadato[]> {
  try {
    const result = await sql`
      SELECT * FROM metadatos
      WHERE tipo_propietario = ${tipoPropietario} AND propietario_id = ${propietarioId}
      ORDER BY namespace, clave
    `
    return result.rows
  } catch (error) {
    console.error(`Error al obtener metadatos para ${tipoPropietario} con ID ${propietarioId}:`, error)
    throw error
  }
}

// Obtener metadatos por tipo de propietario, ID, namespace y clave
export async function getMetadato(
  tipoPropietario: string,
  propietarioId: number,
  namespace: string,
  clave: string,
): Promise<Metadato | null> {
  try {
    const result = await sql`
      SELECT * FROM metadatos
      WHERE 
        tipo_propietario = ${tipoPropietario} AND 
        propietario_id = ${propietarioId} AND
        namespace = ${namespace} AND
        clave = ${clave}
    `
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(
      `Error al obtener metadato para ${tipoPropietario} con ID ${propietarioId}, namespace ${namespace}, clave ${clave}:`,
      error,
    )
    throw error
  }
}

// Crear o actualizar un metadato
export async function upsertMetadato(data: Partial<Metadato>): Promise<Metadato> {
  try {
    const {
      shopify_id,
      tipo_propietario,
      propietario_id,
      shopify_propietario_id,
      namespace,
      clave,
      valor,
      tipo_valor,
    } = data

    // Verificar si el metadato ya existe
    const existingMetadato = await getMetadato(tipo_propietario!, propietario_id!, namespace!, clave!)

    if (existingMetadato) {
      // Actualizar metadato existente
      const result = await sql`
        UPDATE metadatos
        SET
          shopify_id = ${shopify_id || null},
          shopify_propietario_id = ${shopify_propietario_id || null},
          valor = ${valor || null},
          tipo_valor = ${tipo_valor || null},
          fecha_actualizacion = NOW(),
          ultima_sincronizacion = NOW()
        WHERE id = ${existingMetadato.id}
        RETURNING *
      `
      return result.rows[0]
    } else {
      // Crear nuevo metadato
      const result = await sql`
        INSERT INTO metadatos (
          shopify_id, tipo_propietario, propietario_id, shopify_propietario_id,
          namespace, clave, valor, tipo_valor, fecha_creacion, fecha_actualizacion,
          ultima_sincronizacion
        )
        VALUES (
          ${shopify_id || null}, ${tipo_propietario}, ${propietario_id},
          ${shopify_propietario_id || null}, ${namespace}, ${clave},
          ${valor || null}, ${tipo_valor || null}, NOW(), NOW(), NOW()
        )
        RETURNING *
      `
      return result.rows[0]
    }
  } catch (error) {
    console.error("Error al crear/actualizar metadato:", error)
    throw error
  }
}

// Eliminar un metadato
export async function deleteMetadato(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM metadatos
      WHERE id = ${id}
      RETURNING id
    `
    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar metadato con ID ${id}:`, error)
    throw error
  }
}

// Eliminar todos los metadatos de un propietario
export async function deleteMetadatosByPropietario(tipoPropietario: string, propietarioId: number): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM metadatos
      WHERE tipo_propietario = ${tipoPropietario} AND propietario_id = ${propietarioId}
      RETURNING id
    `
    return result.rows.length
  } catch (error) {
    console.error(`Error al eliminar metadatos para ${tipoPropietario} con ID ${propietarioId}:`, error)
    throw error
  }
}

// Sincronizar metadatos con Shopify
export async function syncMetadatosWithShopify(
  tipoPropietario: string,
  propietarioId: number,
  shopifyPropietarioId: string,
  metafields: any[],
): Promise<void> {
  try {
    // Eliminar metadatos existentes
    await deleteMetadatosByPropietario(tipoPropietario, propietarioId)

    // Insertar nuevos metadatos
    for (const metafield of metafields) {
      await upsertMetadato({
        shopify_id: metafield.id,
        tipo_propietario: tipoPropietario,
        propietario_id: propietarioId,
        shopify_propietario_id: shopifyPropietarioId,
        namespace: metafield.namespace,
        clave: metafield.key,
        valor: metafield.value,
        tipo_valor: metafield.type,
      })
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "METAFIELDS",
      entidad_id: shopifyPropietarioId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Metadatos sincronizados para ${tipoPropietario} con ID ${propietarioId}: ${metafields.length} metadatos`,
    })
  } catch (error) {
    console.error(
      `Error al sincronizar metadatos para ${tipoPropietario} con ID ${propietarioId}, Shopify ID ${shopifyPropietarioId}:`,
      error,
    )

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "METAFIELDS",
      entidad_id: shopifyPropietarioId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar metadatos: ${(error as Error).message}`,
    })

    throw error
  }
}
