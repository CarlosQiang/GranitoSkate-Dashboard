import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let promotionsCache = null
let lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export type PromotionStatus = "ACTIVE" | "EXPIRED" | "SCHEDULED" | "UNKNOWN"

export interface Promotion {
  id: string
  title: string
  summary: string
  startsAt: string
  endsAt?: string
  status: PromotionStatus
  target: string
  valueType: string
  value: string
  usageLimit?: number
  usageCount: number
  code?: string
  createdAt: string
  updatedAt: string
}

/**
 * Obtiene todas las promociones (price rules) de Shopify
 * @returns Lista de promociones
 */
export async function fetchPromotions(limit = 50): Promise<Promotion[]> {
  try {
    // Use cache if it exists and is less than 5 minutes old
    const now = new Date()
    if (promotionsCache && lastUpdate && now.getTime() - lastUpdate.getTime() < CACHE_DURATION) {
      console.log("Using promotions cache")
      return promotionsCache
    }

    console.log(`Fetching ${limit} promotions from Shopify...`)

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

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          summary: node.summary || "",
          startsAt: node.startsAt,
          endsAt: node.endsAt,
          status: node.status as PromotionStatus,
          target: node.target,
          valueType: node.valueType.toLowerCase(),
          value: Math.abs(Number.parseFloat(node.value)).toString(),
          usageLimit: node.usageLimit,
          usageCount: usageCount,
          code: code,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
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
    return []
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción
 */
export async function fetchPromotionById(id: string): Promise<Promotion | null> {
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

    return {
      id: node.id.split("/").pop(),
      title: node.title,
      summary: node.summary || "",
      startsAt: node.startsAt,
      endsAt: node.endsAt,
      status: node.status as PromotionStatus,
      target: node.target,
      valueType: node.valueType.toLowerCase(),
      value: Math.abs(Number.parseFloat(node.value)).toString(),
      usageLimit: node.usageLimit,
      usageCount: usageCount,
      code: code,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error al cargar promoción: ${(error as Error).message}`)
  }
}

/**
 * Crea una nueva promoción (price rule)
 * @param data Datos de la promoción
 * @returns La promoción creada
 */
export async function createPromotion(data: any): Promise<any> {
  try {
    // Validar que el valor sea un número positivo
    const value = Number.parseFloat(data.value.toString())
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
    const priceRuleValue = data.valueType === "percentage" ? -Math.abs(value) : -Math.abs(value)

    // Preparar variables para la mutación
    const variables = {
      priceRule: {
        title: data.title,
        target: "LINE_ITEM",
        valueType: data.valueType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value: priceRuleValue.toString(),
        customerSelection: { all: true },
        allocationMethod: "ACROSS",
        startsAt: data.startsAt || new Date().toISOString(),
        endsAt: data.endsAt || null,
        usageLimit: data.usageLimit || null,
      },
    }

    console.log("Creating promotion with variables:", JSON.stringify(variables, null, 2))

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.priceRuleCreate.userErrors && responseData.priceRuleCreate.userErrors.length > 0) {
      throw new Error(responseData.priceRuleCreate.userErrors[0].message)
    }

    // Si es un código de descuento, crear el código
    if (data.code) {
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
          priceRuleId: responseData.priceRuleCreate.priceRule.id,
          code: data.code,
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
      id: responseData.priceRuleCreate.priceRule.id.split("/").pop(),
      title: responseData.priceRuleCreate.priceRule.title,
      ...data,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear promoción: ${(error as Error).message}`)
  }
}

/**
 * Actualiza una promoción existente
 * @param id ID de la promoción
 * @param data Datos a actualizar
 * @returns La promoción actualizada
 */
export async function updatePromotion(id: string, data: any): Promise<any> {
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
    if (data.startsAt) priceRuleInput.startsAt = data.startsAt
    if (data.endsAt !== undefined) priceRuleInput.endsAt = data.endsAt

    if (data.value && data.valueType) {
      const value = Number.parseFloat(data.value.toString())
      if (isNaN(value) || value <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }

      priceRuleInput.valueType = data.valueType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT"
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
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns Success status and ID
 */
export async function deletePromotion(id: string): Promise<any> {
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

/**
 * Crea una actividad de marketing
 * @param data Datos de la actividad
 * @returns La actividad creada
 */
export async function createMarketingActivity(data: any): Promise<any> {
  try {
    const mutation = gql`
      mutation marketingActivityCreate($input: MarketingActivityCreateInput!) {
        marketingActivityCreate(input: $input) {
          marketingActivity {
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

    const variables = {
      input: {
        marketingChannel: "EMAIL",
        status: "ACTIVE",
        ...data,
      },
    }

    const responseData = await shopifyClient.request(mutation, variables)

    if (responseData.marketingActivityCreate.userErrors && responseData.marketingActivityCreate.userErrors.length > 0) {
      throw new Error(responseData.marketingActivityCreate.userErrors[0].message)
    }

    return {
      id: responseData.marketingActivityCreate.marketingActivity.id.split("/").pop(),
      title: responseData.marketingActivityCreate.marketingActivity.title,
      ...data,
    }
  } catch (error) {
    console.error("Error creating marketing activity:", error)
    throw new Error(`Error al crear actividad de marketing: ${(error as Error).message}`)
  }
}

// Alias para compatibilidad
export const fetchPriceListById = fetchPromotionById
export const createPriceList = createPromotion
export const updatePriceList = updatePromotion
export const deletePriceList = deletePromotion
export const getPriceListById = fetchPromotionById
