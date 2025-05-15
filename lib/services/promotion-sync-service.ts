import { Logger } from "next-axiom"
import { shopifyFetch } from "@/lib/shopify-client"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"
import { executeQuery } from "@/lib/db/neon-client"
import { extractIdFromGid } from "@/lib/shopify-client"

const logger = new Logger({
  source: "promotion-sync-service",
})

// Tipos para promociones
export interface ShopifyPromotion {
  id: string
  title: string
  summary?: string
  startsAt?: string
  endsAt?: string
  status: string
  valueType?: string
  value?: number
  code?: string
  usageLimit?: number
  usageCount?: number
  isAutomatic: boolean
}

// Función para sincronizar todas las promociones de Shopify
export async function syncAllPromotions(): Promise<{
  created: number
  updated: number
  failed: number
  total: number
}> {
  try {
    logger.info("Iniciando sincronización de promociones")

    // Obtener promociones de Shopify
    const shopifyPromotions = await fetchPromotionsFromShopify()

    if (!shopifyPromotions || shopifyPromotions.length === 0) {
      logger.warn("No se encontraron promociones en Shopify")

      await logSyncEvent({
        tipo_entidad: "PROMOTION",
        accion: "SYNC_ALL",
        resultado: "WARNING",
        mensaje: "No se encontraron promociones en Shopify",
      })

      return { created: 0, updated: 0, failed: 0, total: 0 }
    }

    // Contadores para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada promoción
    for (const promotion of shopifyPromotions) {
      try {
        // Verificar si la promoción ya existe en la base de datos
        const existingPromotion = await checkPromotionExists(promotion.id)

        if (existingPromotion) {
          // Actualizar promoción existente
          await updatePromotionInDb(existingPromotion.id, promotion)
          updated++
        } else {
          // Crear nueva promoción
          await createPromotionInDb(promotion)
          created++
        }
      } catch (error) {
        logger.error("Error al sincronizar promoción", {
          promotionId: promotion.id,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "PROMOTION",
          entidad_id: promotion.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar promoción: ${error instanceof Error ? error.message : "Error desconocido"}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de promociones completada: ${created} creadas, ${updated} actualizadas, ${failed} fallidas`,
    })

    logger.info("Sincronización de promociones completada", {
      created,
      updated,
      failed,
      total: shopifyPromotions.length,
    })

    return { created, updated, failed, total: shopifyPromotions.length }
  } catch (error) {
    logger.error("Error al sincronizar promociones", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar promociones: ${error instanceof Error ? error.message : "Error desconocido"}`,
    })

    throw error
  }
}

// Función para obtener promociones de Shopify
async function fetchPromotionsFromShopify(): Promise<ShopifyPromotion[]> {
  try {
    const query = `
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              __typename
              ... on DiscountAutomaticNode {
                automaticDiscount {
                  __typename
                  title
                  startsAt
                  endsAt
                  status
                  summary
                }
              }
              ... on DiscountCodeNode {
                codeDiscount {
                  __typename
                  title
                  startsAt
                  endsAt
                  status
                  summary
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const { data, errors } = await shopifyFetch({ query })

    if (errors) {
      logger.error("Error al obtener promociones de Shopify", { errors })
      throw new Error(`Error al obtener promociones de Shopify: ${errors[0].message}`)
    }

    if (!data || !data.discountNodes || !data.discountNodes.edges) {
      logger.warn("Respuesta de Shopify no contiene promociones")
      return []
    }

    // Transformar los datos al formato esperado
    const promotions: ShopifyPromotion[] = []

    for (const edge of data.discountNodes.edges) {
      const node = edge.node
      let promotion: ShopifyPromotion = {
        id: node.id,
        title: "Promoción sin título",
        status: "INACTIVE",
        isAutomatic: node.__typename === "DiscountAutomaticNode",
      }

      if (node.__typename === "DiscountAutomaticNode" && node.automaticDiscount) {
        promotion = {
          ...promotion,
          title: node.automaticDiscount.title || "Promoción automática",
          summary: node.automaticDiscount.summary || "",
          status: node.automaticDiscount.status || "INACTIVE",
          startsAt: node.automaticDiscount.startsAt || null,
          endsAt: node.automaticDiscount.endsAt || null,
        }
      } else if (node.__typename === "DiscountCodeNode" && node.codeDiscount) {
        const code = node.codeDiscount.codes?.edges?.[0]?.node?.code || ""
        promotion = {
          ...promotion,
          title: node.codeDiscount.title || "Promoción con código",
          summary: node.codeDiscount.summary || "",
          status: node.codeDiscount.status || "INACTIVE",
          startsAt: node.codeDiscount.startsAt || null,
          endsAt: node.codeDiscount.endsAt || null,
          code,
        }
      }

      promotions.push(promotion)
    }

    return promotions
  } catch (error) {
    logger.error("Error al obtener promociones de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Verificar si una promoción existe en la base de datos
async function checkPromotionExists(shopifyId: string): Promise<any | null> {
  try {
    const result = await executeQuery(`SELECT id FROM promociones WHERE shopify_id = $1`, [extractIdFromGid(shopifyId)])
    return result.length > 0 ? result[0] : null
  } catch (error) {
    logger.error("Error al verificar existencia de promoción", {
      shopifyId,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    return null
  }
}

// Crear una nueva promoción en la base de datos
async function createPromotionInDb(promotion: ShopifyPromotion): Promise<number> {
  try {
    const shopifyId = extractIdFromGid(promotion.id)
    const activa = promotion.status === "ACTIVE"
    const tipo = promotion.valueType === "percentage" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT"

    const result = await executeQuery(
      `INSERT INTO promociones (
        shopify_id, titulo, descripcion, tipo, valor, codigo, 
        fecha_inicio, fecha_fin, activa, limite_uso, contador_uso, 
        es_automatica, fecha_creacion, fecha_actualizacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      ) RETURNING id`,
      [
        shopifyId,
        promotion.title,
        promotion.summary || null,
        tipo,
        promotion.value || null,
        promotion.code || null,
        promotion.startsAt ? new Date(promotion.startsAt) : null,
        promotion.endsAt ? new Date(promotion.endsAt) : null,
        activa,
        promotion.usageLimit || null,
        promotion.usageCount || 0,
        promotion.isAutomatic,
      ],
    )

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: promotion.id,
      accion: "CREATE",
      resultado: "SUCCESS",
      mensaje: `Promoción creada: ${promotion.title}`,
    })

    return result[0].id
  } catch (error) {
    logger.error("Error al crear promoción en la base de datos", {
      promotionId: promotion.id,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Actualizar una promoción existente en la base de datos
async function updatePromotionInDb(id: number, promotion: ShopifyPromotion): Promise<void> {
  try {
    const shopifyId = extractIdFromGid(promotion.id)
    const activa = promotion.status === "ACTIVE"
    const tipo = promotion.valueType === "percentage" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT"

    await executeQuery(
      `UPDATE promociones SET
        titulo = $1,
        descripcion = $2,
        tipo = $3,
        valor = $4,
        codigo = $5,
        fecha_inicio = $6,
        fecha_fin = $7,
        activa = $8,
        limite_uso = $9,
        contador_uso = $10,
        es_automatica = $11,
        fecha_actualizacion = NOW(),
        ultima_sincronizacion = NOW()
      WHERE id = $12`,
      [
        promotion.title,
        promotion.summary || null,
        tipo,
        promotion.value || null,
        promotion.code || null,
        promotion.startsAt ? new Date(promotion.startsAt) : null,
        promotion.endsAt ? new Date(promotion.endsAt) : null,
        activa,
        promotion.usageLimit || null,
        promotion.usageCount || 0,
        promotion.isAutomatic,
        id,
      ],
    )

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PROMOTION",
      entidad_id: promotion.id,
      accion: "UPDATE",
      resultado: "SUCCESS",
      mensaje: `Promoción actualizada: ${promotion.title}`,
    })
  } catch (error) {
    logger.error("Error al actualizar promoción en la base de datos", {
      promotionId: promotion.id,
      id,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}
