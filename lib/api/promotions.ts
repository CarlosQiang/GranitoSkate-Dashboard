import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let promotionsCache = null
let lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export type PromotionType = "percentage" | "fixed_amount" | "free_shipping" | "BUY_X_GET_Y"
export type PromotionStatus = "active" | "expired" | "scheduled" | "UNKNOWN"

export type Promotion = {
  id: string
  title: string
  code: string | null
  isAutomatic: boolean
  startsAt: string
  endsAt: string | null
  status: PromotionStatus
  valueType: string
  value: string
  currencyCode: string
  summary: string | null
  prices?: any[]
  target?: string
  targetId?: string
  conditions?: any[]
  usageCount?: number
  usageLimit?: number
  error?: boolean
}

/**
 * Fetches all promotions from Shopify
 * @param limit Maximum number of promotions to fetch
 * @returns List of promotions
 */
export async function fetchPromotions(limit = 20) {
  try {
    // Use cache if it exists and is less than 5 minutes old
    const now = new Date()
    if (promotionsCache && lastUpdate && now.getTime() - lastUpdate.getTime() < CACHE_DURATION) {
      console.log("Using promotions cache")
      return promotionsCache
    }

    console.log(`Fetching ${limit} promotions from Shopify...`)

    // Usamos la API REST en lugar de GraphQL para mayor compatibilidad
    const response = await fetch(`/api/shopify/rest/discount_codes?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching promotions: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data || !data.discount_codes) {
      console.error("Incomplete promotions response:", data)
      return []
    }

    const promotions = data.discount_codes.map((code) => {
      return {
        id: code.id.toString(),
        title: code.title || code.code,
        code: code.code,
        isAutomatic: false,
        startsAt: code.starts_at || new Date().toISOString(),
        endsAt: code.ends_at || null,
        status: code.status === "enabled" ? "active" : "UNKNOWN",
        valueType: code.value_type === "percentage" ? "percentage" : "fixed_amount",
        value: code.value.toString(),
        currencyCode: "EUR",
        summary: code.usage_limit ? `Límite de uso: ${code.usage_limit}` : null,
      }
    })

    // Update cache
    promotionsCache = promotions
    lastUpdate = new Date()

    console.log(`Successfully fetched ${promotions.length} promotions`)
    return promotions
  } catch (error) {
    console.error("Error fetching promotions:", error)

    // Intentar obtener promociones usando el método alternativo
    try {
      console.log("Trying alternative method to fetch promotions...")

      // Consulta simplificada para la API de Shopify
      const query = gql`
        {
          discountNodes(first: ${limit}) {
            edges {
              node {
                id
                discount {
                  ... on DiscountCodeBasic {
                    title
                    codes(first: 1) {
                      edges {
                        node {
                          code
                        }
                      }
                    }
                    startsAt
                    endsAt
                    status
                    discountClass
                    combinesWith {
                      orderDiscounts
                      productDiscounts
                      shippingDiscounts
                    }
                    customerGets {
                      value {
                        ... on DiscountPercentageValue {
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

      const graphqlData = await shopifyClient.request(query)

      if (!graphqlData || !graphqlData.discountNodes || !graphqlData.discountNodes.edges) {
        console.error("Incomplete promotions response from alternative method:", graphqlData)
        return []
      }

      const alternativePromotions = graphqlData.discountNodes.edges
        .map((edge) => {
          const node = edge.node
          if (!node || !node.discount) return null

          const discount = node.discount
          const code = discount.codes?.edges?.[0]?.node?.code || null
          let value = "0"
          let valueType = "percentage"

          if (discount.customerGets?.value) {
            if (discount.customerGets.value.percentage) {
              value = (discount.customerGets.value.percentage * 100).toString()
              valueType = "percentage"
            } else if (discount.customerGets.value.amount?.amount) {
              value = discount.customerGets.value.amount.amount.toString()
              valueType = "fixed_amount"
            }
          }

          return {
            id: node.id.split("/").pop(),
            title: discount.title || "Promoción",
            code: code,
            isAutomatic: !code,
            startsAt: discount.startsAt || new Date().toISOString(),
            endsAt: discount.endsAt || null,
            status: discount.status === "ACTIVE" ? "active" : "UNKNOWN",
            valueType: valueType,
            value: value,
            currencyCode: discount.customerGets?.value?.amount?.currencyCode || "EUR",
            summary: null,
          }
        })
        .filter(Boolean)

      // Update cache
      promotionsCache = alternativePromotions
      lastUpdate = new Date()

      console.log(`Successfully fetched ${alternativePromotions.length} promotions using alternative method`)
      return alternativePromotions
    } catch (alternativeError) {
      console.error("Error fetching promotions with alternative method:", alternativeError)

      // Return empty array to avoid breaking the UI
      return []
    }
  }
}

/**
 * Fetches a promotion by its ID
 * @param id Promotion ID
 * @returns Promotion data or null if not found
 */
export async function fetchPromotionById(id) {
  try {
    // Intentar obtener de la caché primero
    if (promotionsCache && lastUpdate) {
      const cachedPromotion = promotionsCache.find((promo) => promo.id === id)
      if (cachedPromotion) {
        console.log(`Using cached promotion for ID: ${id}`)
        return cachedPromotion
      }
    }

    console.log(`Fetching promotion with ID: ${id}`)

    // Intentar obtener usando REST API
    const response = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()

      if (data && data.discount_code) {
        const code = data.discount_code
        return {
          id: code.id.toString(),
          title: code.title || code.code,
          code: code.code,
          isAutomatic: false,
          startsAt: code.starts_at || new Date().toISOString(),
          endsAt: code.ends_at || null,
          status: code.status === "enabled" ? "active" : "UNKNOWN",
          valueType: code.value_type === "percentage" ? "percentage" : "fixed_amount",
          value: code.value.toString(),
          currencyCode: "EUR",
          summary: code.usage_limit ? `Límite de uso: ${code.usage_limit}` : null,
        }
      }
    }

    // Si REST API falla, intentar con GraphQL
    const query = gql`
      {
        discountNode(id: "gid://shopify/DiscountNode/${id}") {
          id
          discount {
            ... on DiscountCodeBasic {
              title
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              startsAt
              endsAt
              status
              discountClass
              combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
              }
              customerGets {
                value {
                  ... on DiscountPercentageValue {
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

    const graphqlData = await shopifyClient.request(query)

    if (!graphqlData || !graphqlData.discountNode || !graphqlData.discountNode.discount) {
      // Si no se encuentra, devolver un objeto con datos mínimos para evitar errores
      return {
        id: id,
        title: "Promoción no encontrada",
        code: null,
        isAutomatic: true,
        startsAt: new Date().toISOString(),
        endsAt: null,
        status: "UNKNOWN",
        valueType: "percentage",
        value: "10",
        currencyCode: "EUR",
        summary: "Esta promoción no se pudo cargar correctamente",
        error: true,
      }
    }

    const node = graphqlData.discountNode
    const discount = node.discount
    const code = discount.codes?.edges?.[0]?.node?.code || null
    let value = "0"
    let valueType = "percentage"

    if (discount.customerGets?.value) {
      if (discount.customerGets.value.percentage) {
        value = (discount.customerGets.value.percentage * 100).toString()
        valueType = "percentage"
      } else if (discount.customerGets.value.amount?.amount) {
        value = discount.customerGets.value.amount.amount.toString()
        valueType = "fixed_amount"
      }
    }

    return {
      id: node.id.split("/").pop(),
      title: discount.title || "Promoción",
      code: code,
      isAutomatic: !code,
      startsAt: discount.startsAt || new Date().toISOString(),
      endsAt: discount.endsAt || null,
      status: discount.status === "ACTIVE" ? "active" : "UNKNOWN",
      valueType: valueType,
      value: value,
      currencyCode: discount.customerGets?.value?.amount?.currencyCode || "EUR",
      summary: null,
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)

    // Devolver un objeto con datos mínimos para evitar errores
    return {
      id: id,
      title: "Error al cargar promoción",
      code: null,
      isAutomatic: true,
      startsAt: new Date().toISOString(),
      endsAt: null,
      status: "UNKNOWN",
      valueType: "percentage",
      value: "10",
      currencyCode: "EUR",
      summary: `Error: ${error.message}`,
      error: true,
    }
  }
}

/**
 * Creates a new promotion
 * @param promotionData Promotion data to create
 * @returns The created promotion
 */
export async function createPromotion(promotionData) {
  try {
    // Validar que el valor sea un número positivo
    const value = Number.parseFloat(promotionData.value)
    if (isNaN(value) || value <= 0) {
      throw new Error("El valor de la promoción debe ser un número mayor que cero")
    }

    // Crear una promoción usando la API REST
    const response = await fetch(`/api/shopify/rest/discount_codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discount_code: {
          code: promotionData.code || `PROMO${Math.floor(Math.random() * 10000)}`,
          value_type: promotionData.valueType,
          value: promotionData.value,
          minimum_order_amount: promotionData.minimumPurchase || "0.00",
          starts_at: promotionData.startsAt || new Date().toISOString(),
          ends_at: promotionData.endsAt || null,
          usage_limit: promotionData.usageLimit || null,
          title: promotionData.title,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Error al crear promoción: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return {
      id: data.discount_code.id.toString(),
      title: data.discount_code.title || data.discount_code.code,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear promoción: ${error.message}`)
  }
}

/**
 * Deletes a promotion
 * @param id Promotion ID
 * @returns Success status and ID
 */
export async function deletePromotion(id) {
  try {
    console.log(`Deleting promotion with ID: ${id}`)

    // Eliminar usando la API REST
    const response = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error al eliminar promoción: ${response.statusText}`)
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return { success: true, id: id }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error deleting promotion: ${error.message}`)
  }
}

/**
 * Updates a promotion
 * @param id Promotion ID
 * @param data Updated promotion data
 * @returns Updated promotion
 */
export async function updatePromotion(id, data) {
  try {
    console.log(`Updating promotion ${id} with data:`, data)

    // Validar que el valor sea un número positivo si se está actualizando
    if (data.value) {
      const value = Number.parseFloat(data.value)
      if (isNaN(value) || value <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }
    }

    // Actualizar usando la API REST
    const updateData = {
      discount_code: {},
    }

    if (data.title) updateData.discount_code.title = data.title
    if (data.code) updateData.discount_code.code = data.code
    if (data.value) updateData.discount_code.value = data.value
    if (data.valueType) updateData.discount_code.value_type = data.valueType
    if (data.startsAt) updateData.discount_code.starts_at = data.startsAt
    if (data.endsAt) updateData.discount_code.ends_at = data.endsAt
    if (data.minimumPurchase) updateData.discount_code.minimum_order_amount = data.minimumPurchase
    if (data.usageLimit) updateData.discount_code.usage_limit = data.usageLimit

    const response = await fetch(`/api/shopify/rest/discount_codes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Error al actualizar promoción: ${errorData.error || response.statusText}`)
    }

    const responseData = await response.json()

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return {
      id: responseData.discount_code.id.toString(),
      title: responseData.discount_code.title || responseData.discount_code.code,
      ...data,
    }
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error)
    throw new Error(`Error updating promotion: ${error.message}`)
  }
}

// Add aliases for compatibility
export const fetchPriceListById = fetchPromotionById
export const createPriceList = createPromotion
export const updatePriceList = updatePromotion
export const fetchPriceLists = fetchPromotions
export const deletePriceList = deletePromotion

// Alias para compatibilidad adicional
export const getPriceListById = fetchPromotionById
