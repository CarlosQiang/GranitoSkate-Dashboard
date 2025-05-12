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

    // Consulta simplificada para la API de Shopify
    // Usamos directamente priceRules que es más estable
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
              discountCodes(first: 1) {
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

        // Map status
        let status = "ACTIVE"
        if (node.status === "ACTIVE") status = "ACTIVE"
        else if (node.status === "EXPIRED") status = "EXPIRED"
        else if (node.status === "SCHEDULED") status = "SCHEDULED"

        // Map value type
        let valueType = "percentage"
        if (node.valueType === "PERCENTAGE") valueType = "percentage"
        else if (node.valueType === "FIXED_AMOUNT") valueType = "fixed_amount"

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          code: code,
          isAutomatic: !hasDiscountCode,
          startsAt: node.startsAt,
          endsAt: node.endsAt,
          status: status,
          valueType: valueType,
          value: Math.abs(Number.parseFloat(node.value)).toString(), // Aseguramos que el valor sea positivo
          currencyCode: "EUR",
          summary: node.summary || null,
        }
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
export async function fetchPromotionById(id) {
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
          discountCodes(first: 1) {
            edges {
              node {
                code
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRule) {
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

    const node = data.priceRule

    // Determine if it has a discount code
    const hasDiscountCode = node.discountCodes?.edges?.length > 0
    const code = hasDiscountCode ? node.discountCodes.edges[0].node.code : null

    // Map status
    let status = "ACTIVE"
    if (node.status === "ACTIVE") status = "ACTIVE"
    else if (node.status === "EXPIRED") status = "ACTIVE"
    else if (node.status === "SCHEDULED") status = "ACTIVE"

    // Map value type
    let valueType = "percentage"
    if (node.valueType === "PERCENTAGE") valueType = "percentage"
    else if (node.valueType === "FIXED_AMOUNT") valueType = "fixed_amount"

    return {
      id: node.id.split("/").pop(),
      title: node.title,
      code: code,
      isAutomatic: !hasDiscountCode,
      startsAt: node.startsAt,
      endsAt: node.endsAt,
      status: status,
      valueType: valueType,
      value: Math.abs(Number.parseFloat(node.value)).toString(), // Aseguramos que el valor sea positivo
      currencyCode: "EUR",
      summary: node.summary || null,
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
    const priceRuleValue = promotionData.valueType === "percentage" ? -Math.abs(value) : -Math.abs(value)

    const variables = {
      priceRule: {
        title: promotionData.title,
        target: "LINE_ITEM",
        valueType: promotionData.valueType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value: priceRuleValue.toString(),
        customerSelection: { all: true },
        allocationMethod: "ACROSS",
        startsAt: promotionData.startsAt || new Date().toISOString(),
        endsAt: promotionData.endsAt || null,
      },
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
    // Format the ID correctly for PriceRule
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Updating promotion ${formattedId} with data:`, data)

    // Validar que el valor sea un número positivo si se está actualizando
    if (data.value) {
      const value = Number.parseFloat(data.value)
      if (isNaN(value) || value <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }
    }

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
    const priceRuleInput = {}

    if (data.title) priceRuleInput.title = data.title
    if (data.startsAt) priceRuleInput.startsAt = data.startsAt
    if (data.endsAt) priceRuleInput.endsAt = data.endsAt

    if (data.value && data.valueType) {
      priceRuleInput.valueType = data.valueType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT"
      priceRuleInput.value = (
        data.valueType === "percentage"
          ? -Math.abs(Number.parseFloat(data.value))
          : -Math.abs(Number.parseFloat(data.value))
      ).toString()
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
