import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let promotionsCache = null
let lastUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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

    // Modificar la consulta GraphQL para usar los endpoints correctos de la API de Shopify
    // Reemplazar la consulta actual por esta versión actualizada:
    const query = gql`
  {
    discountNodes(first: ${limit}) {
      edges {
        node {
          id
          discount {
            ... on DiscountAutomaticNode {
              title
              summary
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
            ... on DiscountCodeNode {
              codeDiscount {
                title
                summary
                startsAt
                endsAt
                status
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
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
  }
`

    const data = await shopifyClient.request(query)

    if (!data || !data.discountNodes || !data.discountNodes.edges) {
      console.error("Incomplete promotions response:", data)
      return []
    }

    // Modificar el procesamiento de la respuesta para adaptarse a la nueva estructura:
    const promotions = data.discountNodes.edges
      .map((edge) => {
        const node = edge.node
        if (!node || !node.discount) return null

        // Determinar si es un descuento automático o un código de descuento
        const isCodeDiscount = node.discount.codeDiscount
        const discountData = isCodeDiscount ? node.discount.codeDiscount : node.discount

        // Obtener el código si existe
        const code =
          isCodeDiscount && discountData.codes?.edges?.length > 0 ? discountData.codes.edges[0].node.code : null

        // Mapear el estado
        let status = "active"
        if (discountData.status === "ACTIVE") status = "active"
        else if (discountData.status === "EXPIRED") status = "expired"
        else if (discountData.status === "SCHEDULED") status = "scheduled"

        // Determinar el tipo y valor del descuento
        let type = "percentage"
        let value = "0"

        if (discountData.customerGets?.value) {
          const discountValue = discountData.customerGets.value
          if (discountValue.percentage) {
            type = "percentage"
            value = (Number.parseFloat(discountValue.percentage) * 100).toString()
          } else if (discountValue.amount) {
            type = "fixed_amount"
            value = discountValue.amount.amount
          }
        }

        return {
          id: node.id.split("/").pop(),
          title: discountData.title,
          code: code,
          isAutomatic: !isCodeDiscount,
          startDate: discountData.startsAt,
          endDate: discountData.endsAt,
          status: status,
          type: type,
          value: value,
          currencyCode: "EUR",
          summary: discountData.summary || null,
        }
      })
      .filter(Boolean) // Eliminar valores nulos

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

// Alias para compatibilidad adicional
export const getPriceListById = fetchPromotionById
