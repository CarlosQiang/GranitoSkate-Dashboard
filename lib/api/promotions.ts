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

    // Consulta para obtener descuentos automáticos
    const automaticDiscountsQuery = gql`
      {
        discountNodes(first: ${limit}, query: "automatic:true") {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticApp {
                  title
                  discountClass
                  startsAt
                  endsAt
                  status
                  appDiscountType {
                    title
                  }
                }
                ... on DiscountAutomaticBasic {
                  title
                  discountClass
                  startsAt
                  endsAt
                  status
                  summary
                  minimumRequirement {
                    ... on DiscountMinimumQuantity {
                      greaterThanOrEqualToQuantity
                    }
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                        currencyCode
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
    `

    // Consulta para obtener códigos de descuento
    const codeDiscountsQuery = gql`
      {
        codeDiscountNodes(first: ${limit}) {
          edges {
            node {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  discountClass
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
              }
            }
          }
        }
      }
    `

    // Intentar obtener descuentos automáticos
    let automaticDiscounts = []
    try {
      const automaticData = await shopifyClient.request(automaticDiscountsQuery)
      if (automaticData && automaticData.discountNodes && automaticData.discountNodes.edges) {
        automaticDiscounts = automaticData.discountNodes.edges
          .map((edge) => {
            const node = edge.node
            if (!node || !node.discount) return null

            const discount = node.discount

            // Extraer el valor del descuento
            let value = "0"
            let valueType = "percentage"
            let currencyCode = "EUR"

            if (discount.customerGets?.value?.percentage) {
              value = discount.customerGets.value.percentage
              valueType = "percentage"
            } else if (discount.customerGets?.value?.amount?.amount) {
              value = discount.customerGets.value.amount.amount
              valueType = "fixed_amount"
              currencyCode = discount.customerGets.value.amount.currencyCode || "EUR"
            }

            // Extraer requisito mínimo si existe
            let minimumRequirement = null
            if (discount.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
              minimumRequirement = {
                type: "subtotal",
                value: discount.minimumRequirement.greaterThanOrEqualToSubtotal.amount,
              }
            } else if (discount.minimumRequirement?.greaterThanOrEqualToQuantity) {
              minimumRequirement = {
                type: "quantity",
                value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
              }
            }

            return {
              id: node.id.split("/").pop(),
              title: discount.title,
              code: null,
              isAutomatic: true,
              startsAt: discount.startsAt,
              endsAt: discount.endsAt,
              status: discount.status,
              valueType: valueType,
              value: value,
              currencyCode: currencyCode,
              minimumRequirement: minimumRequirement,
              summary: discount.summary || null,
            }
          })
          .filter(Boolean)
      }
    } catch (error) {
      console.error("Error fetching automatic discounts:", error)
    }

    // Intentar obtener códigos de descuento
    let codeDiscounts = []
    try {
      const codeData = await shopifyClient.request(codeDiscountsQuery)
      if (codeData && codeData.codeDiscountNodes && codeData.codeDiscountNodes.edges) {
        codeDiscounts = codeData.codeDiscountNodes.edges
          .map((edge) => {
            const node = edge.node
            if (!node || !node.codeDiscount) return null

            const discount = node.codeDiscount

            // Extraer el código
            const code = discount.codes?.edges?.[0]?.node?.code || null

            // Extraer el valor del descuento
            let value = "0"
            let valueType = "percentage"
            let currencyCode = "EUR"

            if (discount.customerGets?.value?.percentage) {
              value = discount.customerGets.value.percentage
              valueType = "percentage"
            } else if (discount.customerGets?.value?.amount?.amount) {
              value = discount.customerGets.value.amount.amount
              valueType = "fixed_amount"
              currencyCode = discount.customerGets.value.amount.currencyCode || "EUR"
            }

            return {
              id: node.id.split("/").pop(),
              title: discount.title,
              code: code,
              isAutomatic: false,
              startsAt: discount.startsAt,
              endsAt: discount.endsAt,
              status: discount.status,
              valueType: valueType,
              value: value,
              currencyCode: currencyCode,
              summary: discount.summary || null,
            }
          })
          .filter(Boolean)
      }
    } catch (error) {
      console.error("Error fetching code discounts:", error)
    }

    // Combinar ambos tipos de descuentos
    const promotions = [...automaticDiscounts, ...codeDiscounts]

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
 * Fetches a promotion by its ID
 * @param id Promotion ID
 * @returns Promotion data or null if not found
 */
export async function fetchPromotionById(id) {
  try {
    // Determine if it's a code discount or automatic discount
    const isCodeDiscount = id.includes("DiscountCodeNode") || !id.includes("DiscountNode")

    // Format the ID correctly
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = isCodeDiscount ? `gid://shopify/DiscountCodeNode/${id}` : `gid://shopify/DiscountNode/${id}`
    }

    console.log(`Fetching ${isCodeDiscount ? "code" : "automatic"} discount with ID: ${formattedId}`)

    const query = gql`
      {
        node(id: "${formattedId}") {
          id
          ... on DiscountCodeNode {
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                discountClass
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
            }
          }
          ... on DiscountNode {
            discount {
              ... on DiscountAutomaticBasic {
                title
                discountClass
                startsAt
                endsAt
                status
                summary
                minimumRequirement {
                  ... on DiscountMinimumQuantity {
                    greaterThanOrEqualToQuantity
                  }
                  ... on DiscountMinimumSubtotal {
                    greaterThanOrEqualToSubtotal {
                      amount
                      currencyCode
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
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.node) {
      throw new Error(`Promotion not found: ${id}`)
    }

    const node = data.node

    if (isCodeDiscount && node.codeDiscount) {
      const discount = node.codeDiscount

      // Extraer el código
      const code = discount.codes?.edges?.[0]?.node?.code || null

      // Extraer el valor del descuento
      let value = "0"
      let valueType = "percentage"
      let currencyCode = "EUR"

      if (discount.customerGets?.value?.percentage) {
        value = discount.customerGets.value.percentage
        valueType = "percentage"
      } else if (discount.customerGets?.value?.amount?.amount) {
        value = discount.customerGets.value.amount.amount
        valueType = "fixed_amount"
        currencyCode = discount.customerGets.value.amount.currencyCode || "EUR"
      }

      return {
        id: node.id.split("/").pop(),
        title: discount.title,
        code: code,
        isAutomatic: false,
        startsAt: discount.startsAt,
        endsAt: discount.endsAt,
        status: discount.status,
        valueType: valueType,
        value: value,
        currencyCode: currencyCode,
        summary: discount.summary || null,
      }
    } else if (!isCodeDiscount && node.discount) {
      const discount = node.discount

      // Extraer el valor del descuento
      let value = "0"
      let valueType = "percentage"
      let currencyCode = "EUR"

      if (discount.customerGets?.value?.percentage) {
        value = discount.customerGets.value.percentage
        valueType = "percentage"
      } else if (discount.customerGets?.value?.amount?.amount) {
        value = discount.customerGets.value.amount.amount
        valueType = "fixed_amount"
        currencyCode = discount.customerGets.value.amount.currencyCode || "EUR"
      }

      // Extraer requisito mínimo si existe
      let minimumRequirement = null
      if (discount.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
        minimumRequirement = {
          type: "subtotal",
          value: discount.minimumRequirement.greaterThanOrEqualToSubtotal.amount,
        }
      } else if (discount.minimumRequirement?.greaterThanOrEqualToQuantity) {
        minimumRequirement = {
          type: "quantity",
          value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
        }
      }

      return {
        id: node.id.split("/").pop(),
        title: discount.title,
        code: null,
        isAutomatic: true,
        startsAt: discount.startsAt,
        endsAt: discount.endsAt,
        status: discount.status,
        valueType: valueType,
        value: value,
        currencyCode: currencyCode,
        minimumRequirement: minimumRequirement,
        summary: discount.summary || null,
      }
    }

    throw new Error(`Unsupported discount type for ID: ${id}`)
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error loading promotion: ${error.message}`)
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

    // Determinar si crear un descuento automático o un código de descuento
    const isAutomatic = !promotionData.code

    let mutation
    let variables

    if (isAutomatic) {
      // Crear un descuento automático según la documentación oficial
      mutation = gql`
        mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
            automaticDiscountNode {
              id
              discount {
                ... on DiscountAutomaticBasic {
                  title
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

      // Preparar variables según la estructura correcta
      variables = {
        automaticBasicDiscount: {
          title: promotionData.title,
          startsAt: promotionData.startsAt || new Date().toISOString(),
          endsAt: promotionData.endsAt,
          combinesWith: {
            productDiscounts: false,
            orderDiscounts: false,
            shippingDiscounts: true,
          },
          customerGets: {
            value:
              promotionData.valueType === "percentage"
                ? { percentage: value }
                : { amount: { amount: value.toString(), currencyCode: "EUR" } },
            items: { all: true },
          },
        },
      }

      // Añadir requisito mínimo si es necesario
      if (promotionData.minimumRequirement && promotionData.minimumRequirement.value) {
        const minValue = Number.parseFloat(promotionData.minimumRequirement.value)
        if (!isNaN(minValue) && minValue > 0) {
          variables.automaticBasicDiscount.minimumRequirement = {
            subtotal: {
              greaterThanOrEqualToSubtotal: minValue.toString(),
              currencyCode: "EUR",
            },
          }
        }
      }
    } else {
      // Crear un código de descuento según la documentación oficial
      mutation = gql`
        mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
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

      // Preparar variables según la estructura correcta
      variables = {
        basicCodeDiscount: {
          title: promotionData.title,
          code: promotionData.code,
          startsAt: promotionData.startsAt || new Date().toISOString(),
          endsAt: promotionData.endsAt,
          combinesWith: {
            productDiscounts: false,
            orderDiscounts: false,
            shippingDiscounts: true,
          },
          customerSelection: { all: true },
          customerGets: {
            value:
              promotionData.valueType === "percentage"
                ? { percentage: value }
                : { amount: { amount: value.toString(), currencyCode: "EUR" } },
            items: { all: true },
          },
        },
      }

      // Añadir límite de usos si es necesario
      if (promotionData.usageLimit && !isNaN(Number(promotionData.usageLimit))) {
        variables.basicCodeDiscount.usageLimit = Number(promotionData.usageLimit)
      }

      // Añadir requisito mínimo si es necesario
      if (promotionData.minimumRequirement && promotionData.minimumRequirement.value) {
        const minValue = Number.parseFloat(promotionData.minimumRequirement.value)
        if (!isNaN(minValue) && minValue > 0) {
          variables.basicCodeDiscount.minimumRequirement = {
            subtotal: {
              greaterThanOrEqualToSubtotal: minValue.toString(),
              currencyCode: "EUR",
            },
          }
        }
      }
    }

    console.log(`Creating ${isAutomatic ? "automatic" : "code"} promotion:`, JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)

    const result = isAutomatic ? data.discountAutomaticBasicCreate : data.discountCodeBasicCreate

    if (result.userErrors && result.userErrors.length > 0) {
      console.error("Errors creating promotion:", result.userErrors)
      throw new Error(`Error creating promotion: ${result.userErrors[0].message}`)
    }

    const resultNode = isAutomatic ? result.automaticDiscountNode : result.codeDiscountNode

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return {
      id: resultNode.id.split("/").pop(),
      title: promotionData.title,
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
    // Determine if it's a code discount or automatic discount
    const isCodeDiscount = id.includes("DiscountCodeNode") || !id.includes("DiscountNode")

    // Format the ID correctly
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = isCodeDiscount ? `gid://shopify/DiscountCodeNode/${id}` : `gid://shopify/DiscountNode/${id}`
    }

    console.log(`Deleting ${isCodeDiscount ? "code" : "automatic"} discount with ID: ${formattedId}`)

    let mutation
    if (isCodeDiscount) {
      mutation = gql`
        mutation discountCodeDelete($id: ID!) {
          discountCodeDelete(id: $id) {
            deletedCodeDiscountId
            userErrors {
              field
              message
            }
          }
        }
      `
    } else {
      mutation = gql`
        mutation discountAutomaticDelete($id: ID!) {
          discountAutomaticDelete(id: $id) {
            deletedAutomaticDiscountId
            userErrors {
              field
              message
            }
          }
        }
      `
    }

    const data = await shopifyClient.request(mutation, { id: formattedId })

    const result = isCodeDiscount ? data.discountCodeDelete : data.discountAutomaticDelete

    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message)
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    const deletedId = isCodeDiscount ? result.deletedCodeDiscountId : result.deletedAutomaticDiscountId
    return { success: true, id: deletedId }
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
    // Determine if it's a code discount or automatic discount
    const isCodeDiscount = id.includes("DiscountCodeNode") || !id.includes("DiscountNode")

    // Format the ID correctly
    let formattedId = id
    if (!id.includes("gid://shopify/")) {
      formattedId = isCodeDiscount ? `gid://shopify/DiscountCodeNode/${id}` : `gid://shopify/DiscountNode/${id}`
    }

    console.log(`Updating ${isCodeDiscount ? "code" : "automatic"} discount with ID: ${formattedId}`)

    // Validar que el valor sea un número positivo si se está actualizando
    if (data.value) {
      const value = Number.parseFloat(data.value)
      if (isNaN(value) || value <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }
    }

    let mutation
    let variables

    if (isCodeDiscount) {
      mutation = gql`
        mutation discountCodeBasicUpdate($id: ID!, $discountCodeBasic: DiscountCodeBasicInput!) {
          discountCodeBasicUpdate(id: $id, discountCodeBasic: $discountCodeBasic) {
            codeDiscountNode {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
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

      // Preparar los datos para la actualización
      const discountCodeBasic = {}

      if (data.title) discountCodeBasic.title = data.title
      if (data.startsAt) discountCodeBasic.startsAt = data.startsAt
      if (data.endsAt) discountCodeBasic.endsAt = data.endsAt

      if (data.value && data.valueType) {
        const value = Number.parseFloat(data.value)
        discountCodeBasic.customerGets = {
          value:
            data.valueType === "percentage"
              ? { percentage: value }
              : { amount: { amount: value.toString(), currencyCode: "EUR" } },
          items: { all: true },
        }
      }

      variables = {
        id: formattedId,
        discountCodeBasic,
      }
    } else {
      mutation = gql`
        mutation discountAutomaticBasicUpdate($id: ID!, $automaticBasicDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicUpdate(id: $id, automaticBasicDiscount: $automaticBasicDiscount) {
            automaticDiscountNode {
              id
              discount {
                ... on DiscountAutomaticBasic {
                  title
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

      // Preparar los datos para la actualización
      const automaticBasicDiscount = {}

      if (data.title) automaticBasicDiscount.title = data.title
      if (data.startsAt) automaticBasicDiscount.startsAt = data.startsAt
      if (data.endsAt) automaticBasicDiscount.endsAt = data.endsAt

      if (data.value && data.valueType) {
        const value = Number.parseFloat(data.value)
        automaticBasicDiscount.customerGets = {
          value:
            data.valueType === "percentage"
              ? { percentage: value }
              : { amount: { amount: value.toString(), currencyCode: "EUR" } },
          items: { all: true },
        }
      }

      variables = {
        id: formattedId,
        automaticBasicDiscount,
      }
    }

    const responseData = await shopifyClient.request(mutation, variables)

    const result = isCodeDiscount ? responseData.discountCodeBasicUpdate : responseData.discountAutomaticBasicUpdate

    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message)
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    const resultNode = isCodeDiscount ? result.codeDiscountNode : result.automaticDiscountNode

    return {
      id: resultNode.id.split("/").pop(),
      title: data.title || (isCodeDiscount ? resultNode.codeDiscount.title : resultNode.discount.title),
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
