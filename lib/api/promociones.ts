const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface PromocionData {
  titulo: string
  descripcion?: string
  tipo: string
  objetivo: string
  valor: string | number
  fechaInicio: string
  fechaFin?: string | null
  codigo?: string | null
  limitarUsos?: boolean
  limiteUsos?: number | null
  compraMinima?: number | null
}

import {
  updateShopifyAutomaticDiscount,
  updateShopifyCodeDiscount,
  createShopifyAutomaticDiscount,
  createShopifyCodeDiscount,
} from "./shopify-promotions"
import {
  createPromocion,
  updatePromocion,
  getPromocionByShopifyId,
  getAllPromociones as getPromocionesDB,
} from "@/lib/db/repositories/promociones-repository"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener promociones combinadas (Shopify + BD local)
export async function fetchPromociones(filter = "todas") {
  try {
    console.log(`🔍 Obteniendo promociones con filtro: ${filter}`)

    // Obtener promociones de Shopify
    let promocionesShopify = []
    try {
      const query = gql`
        query {
          discountNodes(first: 50) {
            edges {
              node {
                id
                discount {
                  ... on DiscountAutomaticBasic {
                    title
                    status
                    startsAt
                    endsAt
                    summary
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                        ... on DiscountAmount {
                          amount {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                  ... on DiscountCodeBasic {
                    title
                    status
                    startsAt
                    endsAt
                    summary
                    codes(first: 1) {
                      nodes {
                        code
                      }
                    }
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                        ... on DiscountAmount {
                          amount {
                            amount
                            currencyCode
                          }
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

      const data = await shopifyClient.request(query)
      promocionesShopify = data.discountNodes.edges.map((edge) => {
        const node = edge.node
        const discount = node.discount

        return {
          id: node.id,
          shopify_id: node.id,
          titulo: discount.title,
          descripcion: discount.summary || "",
          tipo: discount.customerGets?.value?.percentage ? "PORCENTAJE_DESCUENTO" : "CANTIDAD_FIJA_DESCUENTO",
          valor:
            discount.customerGets?.value?.percentage ||
            Number.parseFloat(discount.customerGets?.value?.amount?.amount || "0"),
          codigo: discount.codes?.nodes?.[0]?.code || null,
          fechaInicio: discount.startsAt,
          fechaFin: discount.endsAt,
          activa: discount.status === "ACTIVE",
          estado: discount.status,
          esShopify: true,
        }
      })

      console.log(`✅ Promociones de Shopify: ${promocionesShopify.length}`)
    } catch (error) {
      console.error("❌ Error obteniendo promociones de Shopify:", error)
    }

    // Obtener promociones de la base de datos local
    let promocionesLocales = []
    try {
      promocionesLocales = await getPromocionesDB()
      console.log(`✅ Promociones de BD local: ${promocionesLocales.length}`)
    } catch (error) {
      console.error("❌ Error obteniendo promociones de BD local:", error)
    }

    // Combinar y eliminar duplicados
    const promocionesMap = new Map()

    // Añadir promociones de Shopify
    promocionesShopify.forEach((promo) => {
      promocionesMap.set(promo.shopify_id, promo)
    })

    // Añadir promociones locales que no estén en Shopify
    promocionesLocales.forEach((promo) => {
      if (!promocionesMap.has(promo.shopify_id)) {
        promocionesMap.set(promo.id, {
          ...promo,
          esShopify: false,
        })
      }
    })

    const promocionesCombinadas = Array.from(promocionesMap.values())
    console.log(`✅ Total promociones combinadas: ${promocionesCombinadas.length}`)

    // Aplicar filtros
    let promocionesFiltradas = promocionesCombinadas
    if (filter === "activas") {
      promocionesFiltradas = promocionesCombinadas.filter((p) => p.activa)
    } else if (filter === "programadas") {
      const now = new Date()
      promocionesFiltradas = promocionesCombinadas.filter((p) => p.fechaInicio && new Date(p.fechaInicio) > now)
    } else if (filter === "expiradas") {
      const now = new Date()
      promocionesFiltradas = promocionesCombinadas.filter((p) => p.fechaFin && new Date(p.fechaFin) < now)
    }

    return promocionesFiltradas
  } catch (error) {
    console.error("❌ Error general obteniendo promociones:", error)
    return []
  }
}

// Función para obtener una promoción por ID con sincronización
export async function fetchPromocionById(id: string) {
  try {
    console.log(`🔍 Obteniendo promoción por ID: ${id}`)

    // Formatear el ID si es necesario
    let shopifyId = id
    if (!id.startsWith("gid://")) {
      shopifyId = `gid://shopify/DiscountAutomaticNode/${id}`
    }

    // Intentar obtener de Shopify primero
    try {
      const query = gql`
        query getDiscount($id: ID!) {
          discountNode(id: $id) {
            id
            discount {
              ... on DiscountAutomaticBasic {
                title
                status
                startsAt
                endsAt
                summary
                customerGets {
                  value {
                    ... on DiscountPercentage {
                      percentage
                    }
                    ... on DiscountAmount {
                      amount {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              ... on DiscountCodeBasic {
                title
                status
                startsAt
                endsAt
                summary
                codes(first: 1) {
                  nodes {
                    code
                  }
                }
                customerGets {
                  value {
                    ... on DiscountPercentage {
                      percentage
                    }
                    ... on DiscountAmount {
                      amount {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `

      const data = await shopifyClient.request(query, { id: shopifyId })

      if (data.discountNode) {
        const discount = data.discountNode.discount
        console.log(`✅ Promoción encontrada en Shopify`)

        return {
          id: data.discountNode.id,
          shopify_id: data.discountNode.id,
          titulo: discount.title,
          descripcion: discount.summary || "",
          tipo: discount.customerGets?.value?.percentage ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
          valor:
            discount.customerGets?.value?.percentage ||
            Number.parseFloat(discount.customerGets?.value?.amount?.amount || "0"),
          codigo: discount.codes?.nodes?.[0]?.code || null,
          fechaInicio: discount.startsAt,
          fechaFin: discount.endsAt,
          activa: discount.status === "ACTIVE",
          estado: discount.status,
          esShopify: true,
        }
      }
    } catch (error) {
      console.error("❌ Error obteniendo de Shopify:", error)
    }

    // Si no se encuentra en Shopify, buscar en BD local
    try {
      const promocionLocal = await getPromocionByShopifyId(shopifyId)
      if (promocionLocal) {
        console.log(`✅ Promoción encontrada en BD local`)
        return {
          ...promocionLocal,
          esShopify: false,
        }
      }
    } catch (error) {
      console.error("❌ Error obteniendo de BD local:", error)
    }

    throw new Error("Promoción no encontrada")
  } catch (error) {
    console.error(`❌ Error obteniendo promoción ${id}:`, error)
    throw error
  }
}

// Función para actualizar promoción con sincronización bidireccional
export async function actualizarPromocion(id: string, data: any) {
  try {
    console.log(`📝 Actualizando promoción ${id}:`, data)

    // Formatear el ID si es necesario
    let shopifyId = id
    if (!id.startsWith("gid://")) {
      shopifyId = `gid://shopify/DiscountAutomaticNode/${id}`
    }

    // Intentar actualizar en Shopify primero
    let shopifyResult = null
    try {
      if (data.codigo) {
        shopifyResult = await updateShopifyCodeDiscount(shopifyId, data)
      } else {
        shopifyResult = await updateShopifyAutomaticDiscount(shopifyId, data)
      }
      console.log(`✅ Promoción actualizada en Shopify`)
    } catch (error) {
      console.error("⚠️ No se pudo actualizar en Shopify:", error)
    }

    // Actualizar en base de datos local
    try {
      const promocionLocal = await getPromocionByShopifyId(shopifyId)
      if (promocionLocal) {
        await updatePromocion(promocionLocal.id, {
          titulo: data.titulo,
          descripcion: data.descripcion,
          tipo: data.tipo,
          valor: Number.parseFloat(data.valor),
          codigo: data.codigo,
          fecha_inicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
          fecha_fin: data.fechaFin ? new Date(data.fechaFin) : null,
          activa: data.activa,
          limite_uso: data.limitarUsos ? Number.parseInt(data.limiteUsos) : null,
        })
        console.log(`✅ Promoción actualizada en BD local`)
      } else {
        // Si no existe localmente, crearla
        await createPromocion({
          shopify_id: shopifyId,
          titulo: data.titulo,
          descripcion: data.descripcion,
          tipo: data.tipo,
          valor: Number.parseFloat(data.valor),
          codigo: data.codigo,
          fecha_inicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
          fecha_fin: data.fechaFin ? new Date(data.fechaFin) : null,
          activa: data.activa !== undefined ? data.activa : true,
          limite_uso: data.limitarUsos ? Number.parseInt(data.limiteUsos) : null,
        })
        console.log(`✅ Promoción creada en BD local`)
      }
    } catch (error) {
      console.error("⚠️ Error actualizando en BD local:", error)
    }

    console.log(`✅ Promoción actualizada exitosamente`)
    return {
      id: id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      valor: Number.parseFloat(data.valor),
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      activa: data.activa,
    }
  } catch (error) {
    console.error(`❌ Error actualizando promoción:`, error)
    throw error
  }
}

// Función para crear promoción con sincronización bidireccional
export async function crearPromocion(data: any) {
  try {
    console.log(`📝 Creando promoción:`, data)

    let shopifyResult = null

    // Crear en Shopify primero
    try {
      if (data.codigo) {
        shopifyResult = await createShopifyCodeDiscount(data)
      } else {
        shopifyResult = await createShopifyAutomaticDiscount(data)
      }
      console.log(`✅ Promoción creada en Shopify`)
    } catch (error) {
      console.error("⚠️ No se pudo crear en Shopify:", error)
    }

    // Crear en base de datos local
    const promocionLocal = await createPromocion({
      shopify_id: shopifyResult?.id || null,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      objetivo: data.objetivo,
      valor: Number.parseFloat(data.valor),
      codigo: data.codigo,
      fecha_inicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
      fecha_fin: data.fechaFin ? new Date(data.fechaFin) : null,
      activa: data.activa !== undefined ? data.activa : true,
      limite_uso: data.limitarUsos ? Number.parseInt(data.limitarUsos) : null,
    })

    console.log(`✅ Promoción creada exitosamente:`, promocionLocal)
    return promocionLocal
  } catch (error) {
    console.error(`❌ Error creando promoción:`, error)
    throw error
  }
}

// Función para eliminar promoción
export async function eliminarPromocion(id: string) {
  try {
    console.log(`🗑️ Eliminando promoción ${id}`)

    const response = await fetch(`/api/db/promociones/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al eliminar promoción")
    }

    const result = await response.json()
    console.log(`✅ Promoción eliminada exitosamente`)
    return result
  } catch (error) {
    console.error("❌ Error al eliminar promoción:", error)
    throw error
  }
}

// Exportar alias para compatibilidad con código existente
export const obtenerPromociones = fetchPromociones
export const obtenerPromocionPorId = fetchPromocionById
