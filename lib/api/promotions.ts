import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion } from "@/types/promotions"

// Caché para mejorar rendimiento
let promotionsCache = null
let lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Fetches all promotions from Shopify
 * @param limit Maximum number of promotions to fetch
 * @returns List of promotions
 */
export async function fetchPromotions(limit = 50) {
  try {
    // Use cache if it exists and is less than 5 minutes old
    const now = new Date()
    if (promotionsCache && lastUpdate && now.getTime() - lastUpdate.getTime() < CACHE_DURATION) {
      console.log("Using promotions cache")
      return promotionsCache
    }

    console.log(`Fetching ${limit} promotions from Shopify...`)

    // Consulta para la API de Shopify 2023-07
    const query = gql`
      {
        priceRules(first: ${limit}) {
          edges {
            node {
              id
              title
              summary
              startsAt
              endsAt
              status
              target
              valueType
              value
              usageLimit
              usageCount
              customerSelection {
                all
              }
              discountCodes(first: 1) {
                edges {
                  node {
                    code
                    usageCount
                  }
                }
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRules || !data.priceRules.edges) {
      console.error("Incomplete promotions response:", data)
      return []
    }

    const promotions = data.priceRules.edges
      .map((edge) => {
        const node = edge.node

        if (!node) return null

        // Determine if it has a discount code
        const hasDiscountCode = node.discountCodes?.edges?.length > 0
        const code = hasDiscountCode ? node.discountCodes.edges[0].node.code : null
        const usageCount = hasDiscountCode ? node.discountCodes.edges[0].node.usageCount : node.usageCount || 0

        // Map Shopify status to our status
        let active = true
        if (node.status === "EXPIRED") active = false
        else if (node.status === "SCHEDULED" && new Date(node.startsAt) > new Date()) active = false

        // Map Shopify value type to our type
        let type = "PERCENTAGE_DISCOUNT"
        if (node.valueType === "PERCENTAGE") type = "PERCENTAGE_DISCOUNT"
        else if (node.valueType === "FIXED_AMOUNT") type = "FIXED_AMOUNT_DISCOUNT"

        // Map Shopify target to our target
        let target = "CART"
        if (node.target === "LINE_ITEM") target = "CART"
        else if (node.target === "SHIPPING_LINE") target = "CART"

        // Extract conditions
        const conditions = []

        // Add minimum purchase condition if applicable
        if (node.prerequisiteSubtotalRange && node.prerequisiteSubtotalRange.greaterThanOrEqualTo) {
          conditions.push({
            type: "MINIMUM_AMOUNT",
            value: Number.parseFloat(node.prerequisiteSubtotalRange.greaterThanOrEqualTo),
          })
        }

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          description: node.summary || "",
          type: type,
          target: target,
          targetId: "",
          value: Math.abs(Number.parseFloat(node.value)),
          active: active,
          startDate: node.startsAt,
          endDate: node.endsAt,
          code: code,
          usageLimit: node.usageLimit || null,
          usageCount: usageCount,
          conditions: conditions,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
        } as Promotion
      })
      .filter(Boolean) // Remove any null values

    // Update cache
    promotionsCache = promotions
    lastUpdate = new Date()

    console.log(`Successfully fetched ${promotions.length} promotions`)
    return promotions
  } catch (error) {
    console.error("Error fetching promotions:", error)

    // Return empty array to avoid breaking the UI
    return []
  }
}

/**
 * Fetches a promotion by its ID
 * @param id Promotion ID
 * @returns Promotion data or null if not found
 */
export async function fetchPriceListById(id: string): Promise<Promotion> {
  try {
    // Format the ID correctly for PriceRule
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Fetching promotion with ID: ${formattedId}`)

    const query = gql`
      {
        priceRule(id: "${formattedId}") {
          id
          title
          summary
          startsAt
          endsAt
          status
          target
          valueType
          value
          usageLimit
          usageCount
          customerSelection {
            all
          }
          discountCodes(first: 1) {
            edges {
              node {
                code
                usageCount
              }
            }
          }
          createdAt
          updatedAt
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRule) {
      throw new Error(`Promoción no encontrada: ${id}`)
    }

    const node = data.priceRule

    // Determine if it has a discount code
    const hasDiscountCode = node.discountCodes?.edges?.length > 0
    const code = hasDiscountCode ? node.discountCodes.edges[0].node.code : null
    const usageCount = hasDiscountCode ? node.discountCodes.edges[0].node.usageCount : node.usageCount || 0

    // Map Shopify status to our status
    let active = true
    if (node.status === "EXPIRED") active = false
    else if (node.status === "SCHEDULED" && new Date(node.startsAt) > new Date()) active = false

    // Map Shopify value type to our type
    let type = "PERCENTAGE_DISCOUNT"
    if (node.valueType === "PERCENTAGE") type = "PERCENTAGE_DISCOUNT"
    else if (node.valueType === "FIXED_AMOUNT") type = "FIXED_AMOUNT_DISCOUNT"

    // Map Shopify target to our target
    let target = "CART"
    if (node.target === "LINE_ITEM") target = "CART"
    else if (node.target === "SHIPPING_LINE") target = "CART"

    // Extract conditions
    const conditions = []

    // Add minimum purchase condition if applicable
    if (node.prerequisiteSubtotalRange && node.prerequisiteSubtotalRange.greaterThanOrEqualTo) {
      conditions.push({
        type: "MINIMUM_AMOUNT",
        value: Number.parseFloat(node.prerequisiteSubtotalRange.greaterThanOrEqualTo),
      })
    }

    return {
      id: node.id.split("/").pop(),
      title: node.title,
      description: node.summary || "",
      type: type,
      target: target,
      targetId: "",
      value: Math.abs(Number.parseFloat(node.value)),
      active: active,
      startDate: node.startsAt,
      endDate: node.endsAt,
      code: code,
      usageLimit: node.usageLimit || null,
      usageCount: usageCount,
      conditions: conditions,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    } as Promotion
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error al cargar promoción: ${(error as Error).message}`)
  }
}

/**
 * Creates a new promotion
 * @param promotionData Promotion data to create
 * @returns The created promotion
 */
export async function createPriceList(promotionData: any) {
  try {
    // Validar que el valor sea un número positivo
    const value = Number.parseFloat(promotionData.value.toString())
    if (isNaN(value) || value <= 0) {
      throw new Error("El valor de la promoción debe ser un número mayor que cero")
    }

    // Crear una regla de precio (PriceRule)
    const mutation = gql`
      mutation priceRuleCreate($priceRule: PriceRuleInput!) {
        priceRuleCreate(priceRule: $priceRule) {
          priceRule {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Asegurarse de que el valor sea negativo para descuentos
    const priceRuleValue = promotionData.type === "PERCENTAGE_DISCOUNT" ? -Math.abs(value) : -Math.abs(value)

    // Preparar variables para la mutación
    const variables = {
      priceRule: {
        title: promotionData.title,
        target: "LINE_ITEM",
        valueType: promotionData.type === "PERCENTAGE_DISCOUNT" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value: priceRuleValue.toString(),
        customerSelection: { all: true },
        allocationMethod: "ACROSS",
        startsAt: promotionData.startDate || new Date().toISOString(),
        endsAt: promotionData.endDate || null,
        usageLimit: promotionData.usageLimit || null,
      },
    }

    // Si hay una condición de compra mínima, añadirla
    if (promotionData.conditions && promotionData.conditions.length > 0) {
      const minAmountCondition = promotionData.conditions.find((c) => c.type === "MINIMUM_AMOUNT")
      if (minAmountCondition && minAmountCondition.value) {
        variables.priceRule.prerequisiteSubtotalRange = {
          greaterThanOrEqualTo: minAmountCondition.value.toString(),
        }
      }
    }

    console.log("Creating promotion with variables:", JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)

    if (data.priceRuleCreate.userErrors && data.priceRuleCreate.userErrors.length > 0) {
      throw new Error(data.priceRuleCreate.userErrors[0].message)
    }

    // Si es un código de descuento, crear el código
    if (promotionData.code) {
      const discountCodeMutation = gql`
        mutation discountCodeCreate($discountCode: DiscountCodeInput!) {
          discountCodeCreate(discountCode: $discountCode) {
            discountCode {
              id
              code
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      const discountCodeVariables = {
        discountCode: {
          priceRuleId: data.priceRuleCreate.priceRule.id,
          code: promotionData.code,
        },
      }

      const discountCodeData = await shopifyClient.request(discountCodeMutation, discountCodeVariables)

      if (discountCodeData.discountCodeCreate.userErrors && discountCodeData.discountCodeCreate.userErrors.length > 0) {
        throw new Error(discountCodeData.discountCodeCreate.userErrors[0].message)
      }
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return {
      id: data.priceRuleCreate.priceRule.id.split("/").pop(),
      title: data.priceRuleCreate.priceRule.title,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear promoción: ${(error as Error).message}`)
  }
}

/**
 * Updates a promotion
 * @param id Promotion ID
 * @param data Updated promotion data
 * @returns Updated promotion
 */
export async function updatePriceList(id: string, data: any) {
  try {
    // Format the ID correctly for PriceRule
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Updating promotion ${formattedId} with data:`, data)

    const mutation = gql`
      mutation priceRuleUpdate($id: ID!, $priceRule: PriceRuleInput!) {
        priceRuleUpdate(id: $id, priceRule: $priceRule) {
          priceRule {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    // Preparar los datos para la actualización
    const priceRuleInput: any = {}

    if (data.title) priceRuleInput.title = data.title
    if (data.startDate) priceRuleInput.startsAt = data.startDate
    if (data.endDate !== undefined) priceRuleInput.endsAt = data.endDate

    if (data.value && data.type) {
      const value = Number.parseFloat(data.value.toString())
      if (isNaN(value) || value <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }

      priceRuleInput.valueType = data.type === "PERCENTAGE_DISCOUNT" ? "PERCENTAGE" : "FIXED_AMOUNT"
      priceRuleInput.value = (-Math.abs(value)).toString()
    }

    const variables = {
      id: formattedId,
      priceRule: priceRuleInput,
    }

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleUpdate.userErrors && responseData.priceRuleUpdate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleUpdate.userErrors[0].message)
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return {
      id: responseData.priceRuleUpdate.priceRule.id.split("/").pop(),
      title: responseData.priceRuleUpdate.priceRule.title,
      ...data,
    }
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error)
    throw new Error(`Error al actualizar promoción: ${(error as Error).message}`)
  }
}

/**
 * Deletes a promotion
 * @param id Promotion ID
 * @returns Success status and ID
 */
export async function deletePriceList(id: string) {
  try {
    // Format the ID correctly for PriceRule
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Deleting promotion with ID: ${formattedId}`)

    const mutation = gql`
      mutation priceRuleDelete($id: ID!) {
        priceRuleDelete(id: $id) {
          deletedPriceRuleId
          userErrors {
            field
            message
          }
        }
      }
    `

    const data = await shopifyClient.request(mutation, { id: formattedId })

    if (data.priceRuleDelete.userErrors && data.priceRuleDelete.userErrors.length > 0) {
      throw new Error(data.priceRuleDelete.userErrors[0].message)
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return { success: true, id: data.priceRuleDelete.deletedPriceRuleId }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${(error as Error).message}`)
  }
}

// Alias para compatibilidad
export const fetchPriceLists = fetchPromotions
export const getPriceListById = fetchPriceListById
