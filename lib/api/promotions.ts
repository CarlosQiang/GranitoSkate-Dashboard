import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Tipos para las promociones
export type PromotionType = "PERCENTAGE_DISCOUNT" | "FIXED_AMOUNT_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING"
export type PromotionTarget = "PRODUCT" | "COLLECTION" | "CART"
export type PromotionStatus = "ACTIVE" | "EXPIRED" | "SCHEDULED" | "INACTIVE"

export interface Promotion {
  id: string
  title: string
  summary?: string
  description?: string
  startDate: string
  endDate?: string
  status: PromotionStatus
  target: PromotionTarget
  targetId?: string
  type: PromotionType
  value: string
  code?: string
  usageLimit?: number
  usageCount: number
  conditions?: any[]
  prices?: any[]
  active: boolean
  createdAt: string
  updatedAt: string
}

// Caché para mejorar rendimiento
let promotionsCache = null
let lastPromotionsUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene todas las promociones (price rules) de Shopify
 * @returns Lista de promociones
 */
export async function fetchPromotions(limit = 50) {
  try {
    // Use cache if it exists and is less than 5 minutes old
    const now = new Date()
    if (promotionsCache && lastPromotionsUpdate && now.getTime() - lastPromotionsUpdate.getTime() < CACHE_DURATION) {
      console.log("Using promotions cache")
      return promotionsCache
    }

    console.log(`Fetching ${limit} promotions from Shopify...`)

    const query = gql`
      query GetPriceRules($limit: Int!) {
        priceRules(first: $limit) {
          edges {
            node {
              id
              title
              summary
              createdAt
              updatedAt
              startsAt
              endsAt
              status
              target
              targetType
              targetSelection
              allocationMethod
              valueType
              value
              customerSelection
              usageLimit
              oncePerCustomer
              prerequisiteSubtotalRange {
                greaterThanOrEqualTo
              }
              prerequisiteQuantityRange {
                greaterThanOrEqualTo
              }
              discountCodes(first: 1) {
                edges {
                  node {
                    code
                    usageCount
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.priceRules || !data.priceRules.edges) {
      console.warn("No se encontraron promociones o la respuesta está incompleta")
      return []
    }

    // Transformar los datos para la aplicación
    const promotions = data.priceRules.edges.map((edge) => {
      const node = edge.node
      const discountCode = node.discountCodes?.edges?.[0]?.node

      // Determinar el tipo de promoción
      let type: PromotionType = "PERCENTAGE_DISCOUNT"
      if (node.valueType === "PERCENTAGE") {
        type = "PERCENTAGE_DISCOUNT"
      } else if (node.valueType === "FIXED_AMOUNT") {
        type = "FIXED_AMOUNT_DISCOUNT"
      } else if (node.allocationMethod === "EACH" && node.targetType === "LINE_ITEM") {
        type = "BUY_X_GET_Y"
      } else if (node.targetType === "SHIPPING_LINE") {
        type = "FREE_SHIPPING"
      }

      // Determinar el objetivo de la promoción
      let target: PromotionTarget = "CART"
      if (node.targetType === "LINE_ITEM" && node.targetSelection === "ENTITLED") {
        target = "PRODUCT"
      } else if (node.targetType === "LINE_ITEM" && node.targetSelection === "ENTITLED") {
        target = "COLLECTION"
      }

      // Determinar el estado de la promoción
      const now = new Date()
      const startDate = new Date(node.startsAt)
      const endDate = node.endsAt ? new Date(node.endsAt) : null

      let status: PromotionStatus = "ACTIVE"
      if (startDate > now) {
        status = "SCHEDULED"
      } else if (endDate && endDate < now) {
        status = "EXPIRED"
      } else if (node.status !== "ACTIVE") {
        status = "INACTIVE"
      }

      // Construir condiciones
      const conditions = []

      if (node.prerequisiteSubtotalRange?.greaterThanOrEqualTo) {
        conditions.push({
          type: "MINIMUM_AMOUNT",
          value: node.prerequisiteSubtotalRange.greaterThanOrEqualTo,
        })
      }

      if (node.prerequisiteQuantityRange?.greaterThanOrEqualTo) {
        conditions.push({
          type: "MINIMUM_QUANTITY",
          value: node.prerequisiteQuantityRange.greaterThanOrEqualTo,
        })
      }

      if (node.customerSelection === "PREREQUISITE") {
        conditions.push({
          type: "SPECIFIC_CUSTOMER_GROUP",
          value: "customer_group",
        })
      }

      return {
        id: node.id.split("/").pop(),
        title: node.title,
        summary: node.summary || "",
        description: "",
        startDate: node.startsAt,
        endDate: node.endsAt,
        status,
        target,
        targetId: "",
        type,
        value: node.value,
        code: discountCode?.code,
        usageLimit: node.usageLimit,
        usageCount: discountCode?.usageCount || 0,
        conditions,
        prices: [],
        active: node.status === "ACTIVE",
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      }
    })

    // Update cache
    promotionsCache = promotions
    lastPromotionsUpdate = new Date()

    console.log(`Successfully fetched ${promotions.length} promotions`)
    return promotions
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al cargar promociones: ${(error as Error).message}`)
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción
 */
export async function fetchPromotionById(id: string) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Fetching promotion with ID: ${formattedId}`)

    const query = gql`
      query GetPriceRule($id: ID!) {
        priceRule(id: $id) {
          id
          title
          summary
          createdAt
          updatedAt
          startsAt
          endsAt
          status
          target
          targetType
          targetSelection
          allocationMethod
          valueType
          value
          customerSelection
          usageLimit
          oncePerCustomer
          prerequisiteSubtotalRange {
            greaterThanOrEqualTo
          }
          prerequisiteQuantityRange {
            greaterThanOrEqualTo
          }
          discountCodes(first: 1) {
            edges {
              node {
                code
                usageCount
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.priceRule) {
      throw new Error(`Promoción no encontrada: ${id}`)
    }

    const node = data.priceRule
    const discountCode = node.discountCodes?.edges?.[0]?.node

    // Determinar el tipo de promoción
    let type: PromotionType = "PERCENTAGE_DISCOUNT"
    if (node.valueType === "PERCENTAGE") {
      type = "PERCENTAGE_DISCOUNT"
    } else if (node.valueType === "FIXED_AMOUNT") {
      type = "FIXED_AMOUNT_DISCOUNT"
    } else if (node.allocationMethod === "EACH" && node.targetType === "LINE_ITEM") {
      type = "BUY_X_GET_Y"
    } else if (node.targetType === "SHIPPING_LINE") {
      type = "FREE_SHIPPING"
    }

    // Determinar el objetivo de la promoción
    let target: PromotionTarget = "CART"
    if (node.targetType === "LINE_ITEM" && node.targetSelection === "ENTITLED") {
      target = "PRODUCT"
    } else if (node.targetType === "LINE_ITEM" && node.targetSelection === "ENTITLED") {
      target = "COLLECTION"
    }

    // Determinar el estado de la promoción
    const now = new Date()
    const startDate = new Date(node.startsAt)
    const endDate = node.endsAt ? new Date(node.endsAt) : null

    let status: PromotionStatus = "ACTIVE"
    if (startDate > now) {
      status = "SCHEDULED"
    } else if (endDate && endDate < now) {
      status = "EXPIRED"
    } else if (node.status !== "ACTIVE") {
      status = "INACTIVE"
    }

    // Construir condiciones
    const conditions = []

    if (node.prerequisiteSubtotalRange?.greaterThanOrEqualTo) {
      conditions.push({
        type: "MINIMUM_AMOUNT",
        value: node.prerequisiteSubtotalRange.greaterThanOrEqualTo,
      })
    }

    if (node.prerequisiteQuantityRange?.greaterThanOrEqualTo) {
      conditions.push({
        type: "MINIMUM_QUANTITY",
        value: node.prerequisiteQuantityRange.greaterThanOrEqualTo,
      })
    }

    if (node.customerSelection === "PREREQUISITE") {
      conditions.push({
        type: "SPECIFIC_CUSTOMER_GROUP",
        value: "customer_group",
      })
    }

    return {
      id: node.id.split("/").pop(),
      title: node.title,
      summary: node.summary || "",
      description: "",
      startDate: node.startsAt,
      endDate: node.endsAt,
      status,
      target,
      targetId: "",
      type,
      value: node.value,
      code: discountCode?.code,
      usageLimit: node.usageLimit,
      usageCount: discountCode?.usageCount || 0,
      conditions,
      prices: [],
      active: node.status === "ACTIVE",
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error al cargar promoción: ${(error as Error).message}`)
  }
}

// Añadir alias para getPromotionById
export const getPromotionById = fetchPromotionById

/**
 * Crea una nueva promoción (price rule)
 * @param data Datos de la promoción
 * @returns La promoción creada
 */
export async function createPromotion(data: any) {
  try {
    console.log("Creating promotion:", data)

    // Determinar el tipo de valor y método de asignación
    let valueType = "PERCENTAGE"
    if (data.type === "FIXED_AMOUNT_DISCOUNT") {
      valueType = "FIXED_AMOUNT"
    }

    let allocationMethod = "ACROSS"
    if (data.type === "BUY_X_GET_Y") {
      allocationMethod = "EACH"
    }

    // Determinar el tipo de objetivo y selección
    let targetType = "LINE_ITEM"
    let targetSelection = "ALL"

    if (data.target === "PRODUCT") {
      targetType = "LINE_ITEM"
      targetSelection = "ENTITLED"
    } else if (data.target === "COLLECTION") {
      targetType = "LINE_ITEM"
      targetSelection = "ENTITLED"
    } else if (data.type === "FREE_SHIPPING") {
      targetType = "SHIPPING_LINE"
    }

    // Construir prerequisitos
    const prerequisiteSubtotalRange = {}
    const prerequisiteQuantityRange = {}

    if (data.conditions) {
      data.conditions.forEach((condition) => {
        if (condition.type === "MINIMUM_AMOUNT") {
          prerequisiteSubtotalRange.greaterThanOrEqualTo = condition.value
        } else if (condition.type === "MINIMUM_QUANTITY") {
          prerequisiteQuantityRange.greaterThanOrEqualTo = condition.value
        }
      })
    }

    const mutation = gql`
      mutation priceRuleCreate($input: PriceRuleInput!) {
        priceRuleCreate(priceRule: $input) {
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

    const variables = {
      input: {
        title: data.title,
        startsAt: data.startDate,
        endsAt: data.endDate,
        valueType,
        value: data.value,
        customerSelection: "ALL",
        allocationMethod,
        targetType,
        targetSelection,
        prerequisiteSubtotalRange: Object.keys(prerequisiteSubtotalRange).length > 0 ? prerequisiteSubtotalRange : null,
        prerequisiteQuantityRange: Object.keys(prerequisiteQuantityRange).length > 0 ? prerequisiteQuantityRange : null,
        usageLimit: data.usageLimit,
        oncePerCustomer: data.oncePerCustomer || false,
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.priceRuleCreate.userErrors && result.priceRuleCreate.userErrors.length > 0) {
      throw new Error(result.priceRuleCreate.userErrors[0].message)
    }

    // Si se proporcionó un código, crear el código de descuento
    let discountCode = null
    if (data.code) {
      const codeResult = await createDiscountCode(result.priceRuleCreate.priceRule.id, data.code)
      discountCode = codeResult.code
    }

    // Invalidate cache
    promotionsCache = null
    lastPromotionsUpdate = null

    return {
      id: result.priceRuleCreate.priceRule.id.split("/").pop(),
      title: result.priceRuleCreate.priceRule.title,
      code: discountCode,
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
export async function updatePromotion(id: string, data: any) {
  try {
    // Formatear el ID correctamente
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = `gid://shopify/PriceRule/${id}`
    }

    console.log(`Updating promotion with ID: ${formattedId}`, data)

    // Determinar el tipo de valor y método de asignación
    let valueType = "PERCENTAGE"
    if (data.type === "FIXED_AMOUNT_DISCOUNT") {
      valueType = "FIXED_AMOUNT"
    }

    let allocationMethod = "ACROSS"
    if (data.type === "BUY_X_GET_Y") {
      allocationMethod = "EACH"
    }

    // Determinar el tipo de objetivo y selección
    let targetType = "LINE_ITEM"
    let targetSelection = "ALL"

    if (data.target === "PRODUCT") {
      targetType = "LINE_ITEM"
      targetSelection = "ENTITLED"
    } else if (data.target === "COLLECTION") {
      targetType = "LINE_ITEM"
      targetSelection = "ENTITLED"
    } else if (data.type === "FREE_SHIPPING") {
      targetType = "SHIPPING_LINE"
    }

    // Construir prerequisitos
    const prerequisiteSubtotalRange = {}
    const prerequisiteQuantityRange = {}

    if (data.conditions) {
      data.conditions.forEach((condition) => {
        if (condition.type === "MINIMUM_AMOUNT") {
          prerequisiteSubtotalRange.greaterThanOrEqualTo = condition.value
        } else if (condition.type === "MINIMUM_QUANTITY") {
          prerequisiteQuantityRange.greaterThanOrEqualTo = condition.value
        }
      })
    }

    const mutation = gql`
      mutation priceRuleUpdate($id: ID!, $input: PriceRuleInput!) {
        priceRuleUpdate(id: $id, priceRule: $input) {
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

    const variables = {
      id: formattedId,
      input: {
        title: data.title,
        startsAt: data.startDate,
        endsAt: data.endDate,
        status: data.active ? "ACTIVE" : "DISABLED",
        valueType,
        value: data.value,
        usageLimit: data.usageLimit,
        prerequisiteSubtotalRange: Object.keys(prerequisiteSubtotalRange).length > 0 ? prerequisiteSubtotalRange : null,
        prerequisiteQuantityRange: Object.keys(prerequisiteQuantityRange).length > 0 ? prerequisiteQuantityRange : null,
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.priceRuleUpdate.userErrors && result.priceRuleUpdate.userErrors.length > 0) {
      throw new Error(result.priceRuleUpdate.userErrors[0].message)
    }

    // Invalidate cache
    promotionsCache = null
    lastPromotionsUpdate = null

    return {
      id: result.priceRuleUpdate.priceRule.id.split("/").pop(),
      title: result.priceRuleUpdate.priceRule.title,
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
export async function deletePromotion(id: string) {
  try {
    // Formatear el ID correctamente
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

    const result = await shopifyClient.request(mutation, { id: formattedId })

    if (result.priceRuleDelete.userErrors && result.priceRuleDelete.userErrors.length > 0) {
      throw new Error(result.priceRuleDelete.userErrors[0].message)
    }

    // Invalidate cache
    promotionsCache = null
    lastPromotionsUpdate = null

    return { success: true, id }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar promoción: ${(error as Error).message}`)
  }
}

/**
 * Crea un código de descuento para una regla de precio
 * @param priceRuleId ID de la regla de precio
 * @param code Código de descuento
 * @returns El código de descuento creado
 */
async function createDiscountCode(priceRuleId: string, code: string) {
  try {
    const mutation = gql`
      mutation discountCodeBasicCreate($priceRuleId: ID!, $code: String!) {
        discountCodeBasicCreate(
          basicCodeDiscount: { priceRuleId: $priceRuleId, code: $code }
        ) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
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
          userErrors {
            field
            message
          }
        }
      }
    `

    const result = await shopifyClient.request(mutation, { priceRuleId, code })

    if (result.discountCodeBasicCreate.userErrors && result.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(result.discountCodeBasicCreate.userErrors[0].message)
    }

    return {
      id: result.discountCodeBasicCreate.codeDiscountNode.id,
      code: result.discountCodeBasicCreate.codeDiscountNode.codeDiscount.codes.edges[0].node.code,
    }
  } catch (error) {
    console.error(`Error creating discount code for price rule ${priceRuleId}:`, error)
    throw new Error(`Error al crear código de descuento: ${(error as Error).message}`)
  }
}

// Alias para compatibilidad
export const fetchPriceListById = fetchPromotionById
export const createPriceList = createPromotion
export const updatePriceList = updatePromotion
export const deletePriceList = deletePromotion
export const getPriceListById = fetchPromotionById
