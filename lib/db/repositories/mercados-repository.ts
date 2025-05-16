import { sql } from "@vercel/postgres"
import type { Mercado } from "../schema"
import { logSyncEvent } from "./registro-repository"

// Obtener todos los mercados
export async function getAllMercados(): Promise<Mercado[]> {
  try {
    const result = await sql`
      SELECT * FROM mercados
      ORDER BY es_principal DESC, nombre ASC
    `
    return result.rows
  } catch (error) {
    console.error("Error al obtener mercados:", error)
    throw error
  }
}

// Obtener un mercado por ID
export async function getMercadoById(id: number): Promise<Mercado | null> {
  try {
    const result = await sql`
      SELECT * FROM mercados
      WHERE id = ${id}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener mercado con ID ${id}:`, error)
    throw error
  }
}

// Obtener un mercado por Shopify ID
export async function getMercadoByShopifyId(shopifyId: string): Promise<Mercado | null> {
  try {
    const result = await sql`
      SELECT * FROM mercados
      WHERE shopify_id = ${shopifyId}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener mercado con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

// Crear un nuevo mercado
export async function createMercado(data: Partial<Mercado>): Promise<Mercado> {
  try {
    const {
      shopify_id,
      nombre,
      activo = false,
      es_principal = false,
      moneda_codigo,
      moneda_simbolo,
      dominio,
      subfolder_sufijo,
      paises,
      idiomas,
    } = data

    // Si es principal, actualizar los demás mercados
    if (es_principal) {
      await sql`
        UPDATE mercados
        SET es_principal = false
        WHERE es_principal = true
      `
    }

    const result = await sql`
      INSERT INTO mercados (
        shopify_id, nombre, activo, es_principal, moneda_codigo,
        moneda_simbolo, dominio, subfolder_sufijo, paises, idiomas,
        fecha_creacion, fecha_actualizacion
      )
      VALUES (
        ${shopify_id || null}, ${nombre}, ${activo}, ${es_principal},
        ${moneda_codigo || null}, ${moneda_simbolo || null}, ${dominio || null},
        ${subfolder_sufijo || null}, ${paises ? JSON.stringify(paises) : null},
        ${idiomas ? JSON.stringify(idiomas) : null}, NOW(), NOW()
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear mercado:", error)
    throw error
  }
}

// Actualizar un mercado existente
export async function updateMercado(id: number, data: Partial<Mercado>): Promise<Mercado> {
  try {
    // Primero obtenemos el mercado actual
    const currentMercado = await getMercadoById(id)
    if (!currentMercado) {
      throw new Error(`Mercado con ID ${id} no encontrado`)
    }

    // Si se está estableciendo como principal, actualizar los demás mercados
    if (data.es_principal && !currentMercado.es_principal) {
      await sql`
        UPDATE mercados
        SET es_principal = false
        WHERE es_principal = true
      `
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentMercado,
      ...data,
      fecha_actualizacion: new Date(),
    }

    const {
      shopify_id,
      nombre,
      activo,
      es_principal,
      moneda_codigo,
      moneda_simbolo,
      dominio,
      subfolder_sufijo,
      paises,
      idiomas,
      ultima_sincronizacion,
    } = updatedData

    const result = await sql`
      UPDATE mercados
      SET
        shopify_id = ${shopify_id || null},
        nombre = ${nombre},
        activo = ${activo},
        es_principal = ${es_principal},
        moneda_codigo = ${moneda_codigo || null},
        moneda_simbolo = ${moneda_simbolo || null},
        dominio = ${dominio || null},
        subfolder_sufijo = ${subfolder_sufijo || null},
        paises = ${paises ? JSON.stringify(paises) : null},
        idiomas = ${idiomas ? JSON.stringify(idiomas) : null},
        fecha_actualizacion = NOW(),
        ultima_sincronizacion = ${ultima_sincronizacion || null}
      WHERE id = ${id}
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar mercado con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un mercado
export async function deleteMercado(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM mercados
      WHERE id = ${id}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar mercado con ID ${id}:`, error)
    throw error
  }
}

// Sincronizar un mercado con Shopify
export async function syncMercadoWithShopify(market: any): Promise<Mercado> {
  try {
    // Buscar si el mercado ya existe
    const existingMercado = await getMercadoByShopifyId(market.id)

    if (existingMercado) {
      // Actualizar mercado existente
      const updatedMercado = await updateMercado(existingMercado.id, {
        nombre: market.name,
        activo: market.enabled || false,
        es_principal: market.primary || false,
        moneda_codigo: market.currency?.code,
        moneda_simbolo: market.currency?.symbol,
        dominio: market.web?.domain,
        subfolder_sufijo: market.web?.subfolderSuffix,
        paises: market.countries || [],
        idiomas: market.languages || {},
        ultima_sincronizacion: new Date(),
      })

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "MARKET",
        entidad_id: market.id,
        accion: "UPDATE",
        resultado: "SUCCESS",
        mensaje: `Mercado actualizado: ${market.name}`,
      })

      return updatedMercado
    } else {
      // Crear nuevo mercado
      const newMercado = await createMercado({
        shopify_id: market.id,
        nombre: market.name,
        activo: market.enabled || false,
        es_principal: market.primary || false,
        moneda_codigo: market.currency?.code,
        moneda_simbolo: market.currency?.symbol,
        dominio: market.web?.domain,
        subfolder_sufijo: market.web?.subfolderSuffix,
        paises: market.countries || [],
        idiomas: market.languages || {},
        ultima_sincronizacion: new Date(),
      })

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "MARKET",
        entidad_id: market.id,
        accion: "CREATE",
        resultado: "SUCCESS",
        mensaje: `Mercado creado: ${market.name}`,
      })

      return newMercado
    }
  } catch (error) {
    console.error(`Error al sincronizar mercado con Shopify ID ${market.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "MARKET",
      entidad_id: market.id,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar mercado: ${(error as Error).message}`,
    })

    throw error
  }
}
