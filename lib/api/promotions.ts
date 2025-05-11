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

    // Query for Shopify API 2024-04
    const query = gql`
      query GetDiscounts($limit: Int!) {
        discounts(first: $limit) {
          edges {
            node {
              id
              ... on DiscountCodeBasic {
                title
                summary
                status
                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
                }
                startsAt
                endsAt
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
                customerGets {
                  items {
                    ... on AllDiscountItems {
                      allItems
                    }
                  }
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
              ... on DiscountAutomaticBasic {
                title
                summary
                status
                startsAt
                endsAt
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
                customerGets {
                  items {
                    ... on AllDiscountItems {
                      allItems
                    }
                  }
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
                minimumRequirement {
                  ... on DiscountMinimumSubtotal {
                    subtotal {
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

    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.discounts || !data.discounts.edges) {
      console.error("Incomplete promotions response:", data)

      // Try with alternative query for older API versions
      return await fetchPromotionsAlternative(limit)
    }

    const promotions = data.discounts.edges
      .map((edge) => {
        const node = edge.node

        if (!node) return null

        // Determine if it's an automatic discount or a discount code
        const isAutomatic = !node.codes

        // Extract the code if it's a discount code
        const code = !isAutomatic && node.codes?.edges?.[0]?.node?.code

        // Extract the discount value
        let value = "0"
        let valueType = "percentage"
        let currencyCode = "EUR"

        if (node.customerGets?.value?.percentage) {
          value = node.customerGets.value.percentage
          valueType = "percentage"
        } else if (node.customerGets?.value?.amount?.amount) {
          value = node.customerGets.value.amount.amount
          valueType = "fixed_amount"
          currencyCode = node.customerGets.value.amount.currencyCode || "EUR"
        }

        // Extract minimum requirement if it exists
        let minimumRequirement = null
        if (node.minimumRequirement?.subtotal?.amount) {
          minimumRequirement = {
            type: "subtotal",
            value: node.minimumRequirement.subtotal.amount,
          }
        }

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          code: code || null,
          isAutomatic: isAutomatic,
          startsAt: node.startsAt,
          endsAt: node.endsAt,
          status: node.status,
          valueType: valueType,
          value: value,
          currencyCode: currencyCode,
          minimumRequirement: minimumRequirement,
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

    // Try with alternative query for older API versions
    return await fetchPromotionsAlternative(limit)
  }
}

/**
 * Alternative method to fetch promotions using price rules
 * This is used as a fallback for older API versions
 */
async function fetchPromotionsAlternative(limit = 20) {
  try {
    console.log(`Trying alternative method to fetch ${limit} promotions...`)

    const query = gql`
      query {
        priceRules(first: ${limit}) {
          edges {
            node {
              id
              title
              target
              startsAt
              endsAt
              status
              valueType
              value
              oncePerCustomer
              usageLimit
              customerSelection {
                all
              }
              allocationMethod
              discountCodes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              prerequisiteSubtotalRange {
                greaterThanOrEqualTo
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.priceRules || !data.priceRules.edges) {
      console.error("Incomplete alternative promotions response:", data)
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

        // Extract minimum requirement if it exists
        let minimumRequirement = null
        if (node.prerequisiteSubtotalRange?.greaterThanOrEqualTo) {
          minimumRequirement = {
            type: "subtotal",
            value: node.prerequisiteSubtotalRange.greaterThanOrEqualTo,
          }
        }

        return {
          id: node.id.split("/").pop(),
          title: node.title,
          code: code,
          isAutomatic: !hasDiscountCode,
          startsAt: node.startsAt,
          endsAt: node.endsAt,
          status: status,
          valueType: valueType,
          value: node.value,
          currencyCode: "EUR",
          minimumRequirement: minimumRequirement,
          summary: null,
        }
      })
      .filter(Boolean) // Remove any null values

    // Update cache
    promotionsCache = promotions
    lastUpdate = new Date()

    console.log(`Successfully fetched ${promotions.length} promotions using alternative method`)
    return promotions
  } catch (error) {
    console.error("Error fetching promotions with alternative method:", error)

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
    // Ensure the ID has the correct format
    const isFullShopifyId = id.includes("gid://shopify/")
    let formattedId = id

    if (!isFullShopifyId) {
      formattedId = `gid://shopify/Discount/${id}`
    }

    console.log(`Fetching promotion with ID: ${formattedId}`)

    const query = gql`
      query {
        node(id: "${formattedId}") {
          id
          ... on DiscountCodeBasic {
            title
            summary
            status
            codes(first: 1) {
              edges {
                node {
                  code
                }
              }
            }
            startsAt
            endsAt
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
            customerGets {
              items {
                ... on AllDiscountItems {
                  allItems
                }
              }
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
          ... on DiscountAutomaticBasic {
            title
            summary
            status
            startsAt
            endsAt
            combinesWith {
              orderDiscounts
              productDiscounts
              shippingDiscounts
            }
            customerGets {
              items {
                ... on AllDiscountItems {
                  allItems
                }
              }
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
            minimumRequirement {
              ... on DiscountMinimumSubtotal {
                subtotal {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.node) {
      // Try with a different type of ID
      return await fetchPromotionByIdAlternative(id)
    }

    const node = data.node

    // Determine if it's an automatic discount or a discount code
    const isAutomatic = !node.codes

    // Extract the code if it's a discount code
    const code = !isAutomatic && node.codes?.edges?.[0]?.node?.code

    // Extract the discount value
    let value = "0"
    let valueType = "percentage"
    let currencyCode = "EUR"

    if (node.customerGets?.value?.percentage) {
      value = node.customerGets.value.percentage
      valueType = "percentage"
    } else if (node.customerGets?.value?.amount?.amount) {
      value = node.customerGets.value.amount.amount
      valueType = "fixed_amount"
      currencyCode = node.customerGets.value.amount.currencyCode || "EUR"
    }

    // Extract minimum requirement if it exists
    let minimumRequirement = null
    if (node.minimumRequirement?.subtotal?.amount) {
      minimumRequirement = {
        type: "subtotal",
        value: node.minimumRequirement.subtotal.amount,
      }
    }

    return {
      id: node.id.split("/").pop(),
      title: node.title,
      code: code || null,
      isAutomatic: isAutomatic,
      startsAt: node.startsAt,
      endsAt: node.endsAt,
      status: node.status,
      valueType: valueType,
      value: value,
      currencyCode: currencyCode,
      minimumRequirement: minimumRequirement,
      summary: node.summary || null,
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)

    // Try with alternative query for older API versions
    return await fetchPromotionByIdAlternative(id)
  }
}

/**
 * Alternative method to fetch a promotion by its ID using price rules
 * This is used as a fallback for older API versions
 */
async function fetchPromotionByIdAlternative(id) {
  try {
    console.log(`Trying alternative method to fetch promotion with ID: ${id}`)

    // Try with PriceRule ID
    const priceRuleId = `gid://shopify/PriceRule/${id.split("/").pop()}`

    const query = gql`
      query {
        node(id: "${priceRuleId}") {
          id
          ... on PriceRule {
            title
            target
            startsAt
            endsAt
            status
            valueType
            value
            oncePerCustomer
            usageLimit
            customerSelection {
              all
            }
            allocationMethod
            discountCodes(first: 1) {
              edges {
                node {
                  code
                }
              }
            }
            prerequisiteSubtotalRange {
              greaterThanOrEqualTo
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

    // Extract minimum requirement if it exists
    let minimumRequirement = null
    if (node.prerequisiteSubtotalRange?.greaterThanOrEqualTo) {
      minimumRequirement = {
        type: "subtotal",
        value: node.prerequisiteSubtotalRange.greaterThanOrEqualTo,
      }
    }

    return {
      id: node.id.split("/").pop(),
      title: node.title,
      code: code,
      isAutomatic: !hasDiscountCode,
      startsAt: node.startsAt,
      endsAt: node.endsAt,
      status: status,
      valueType: valueType,
      value: node.value,
      currencyCode: "EUR",
      minimumRequirement: minimumRequirement,
      summary: null,
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id} with alternative method:`, error)
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
    // Determine whether to create an automatic discount or a discount code
    const isAutomatic = !promotionData.code

    let mutation
    let variables

    if (isAutomatic) {
      // Create an automatic discount
      mutation = gql`
        mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
            automaticDiscountNode {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      variables = {
        automaticBasicDiscount: {
          title: promotionData.title,
          startsAt: promotionData.startsAt || new Date().toISOString(),
          endsAt: promotionData.endsAt,
          customerGets: {
            value:
              promotionData.valueType === "percentage"
                ? { percentage: Number.parseFloat(promotionData.value) }
                : { amount: { amount: promotionData.value, currencyCode: "EUR" } },
            items: { all: true },
          },
          minimumRequirement: promotionData.minimumRequirement
            ? { subtotal: { amount: promotionData.minimumRequirement.value, currencyCode: "EUR" } }
            : null,
        },
      }
    } else {
      // Create a discount code
      mutation = gql`
        mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      variables = {
        basicCodeDiscount: {
          title: promotionData.title,
          code: promotionData.code,
          startsAt: promotionData.startsAt || new Date().toISOString(),
          endsAt: promotionData.endsAt,
          customerSelection: { all: true },
          customerGets: {
            value:
              promotionData.valueType === "percentage"
                ? { percentage: Number.parseFloat(promotionData.value) }
                : { amount: { amount: promotionData.value, currencyCode: "EUR" } },
            items: { all: true },
          },
          usageLimit: promotionData.usageLimit ? Number.parseInt(promotionData.usageLimit) : null,
        },
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

    // Try with alternative method for older API versions
    return await createPromotionAlternative(promotionData)
  }
}

/**
 * Alternative method to create a promotion using price rules
 * This is used as a fallback for older API versions
 */
async function createPromotionAlternative(promotionData) {
  try {
    console.log("Trying alternative method to create promotion...")

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

    const variables = {
      priceRule: {
        title: promotionData.title,
        target: "LINE_ITEM",
        valueType: promotionData.valueType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
        value:
          promotionData.valueType === "percentage"
            ? -Number.parseFloat(promotionData.value)
            : -Number.parseFloat(promotionData.value),
        customerSelection: { all: true },
        allocationMethod: "ACROSS",
        validityPeriod: {
          start: promotionData.startsAt || new Date().toISOString(),
          end: promotionData.endsAt || null,
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.priceRuleCreate.userErrors && data.priceRuleCreate.userErrors.length > 0) {
      throw new Error(data.priceRuleCreate.userErrors[0].message)
    }

    // If it's a discount code, create the code
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
    console.error("Error creating promotion with alternative method:", error)
    throw new Error(`Error creating promotion: ${error.message}`)
  }
}

/**
 * Deletes a promotion
 * @param id Promotion ID
 * @returns Success status and ID
 */
export async function deletePromotion(id) {
  try {
    // Ensure the ID has the correct format
    const isFullShopifyId = id.includes("gid://shopify/")
    let formattedId = id

    if (!isFullShopifyId) {
      formattedId = `gid://shopify/Discount/${id}`
    }

    // Try to delete as a discount
    const query = gql`
      mutation discountDelete($id: ID!) {
        discountDelete(id: $id) {
          deletedDiscountId
          userErrors {
            field
            message
          }
        }
      }
    `

    console.log(`Deleting discount with ID: ${formattedId}`)

    const data = await shopifyClient.request(query, { id: formattedId })

    if (data.discountDelete.userErrors && data.discountDelete.userErrors.length > 0) {
      // Try as PriceRule
      return await deletePromotionAlternative(id)
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return { success: true, id: data.discountDelete.deletedDiscountId }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)

    // Try with alternative method for older API versions
    return await deletePromotionAlternative(id)
  }
}

/**
 * Alternative method to delete a promotion using price rules
 * This is used as a fallback for older API versions
 */
async function deletePromotionAlternative(id) {
  try {
    console.log(`Trying alternative method to delete promotion with ID: ${id}`)

    const priceRuleId = `gid://shopify/PriceRule/${id.split("/").pop()}`

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

    const data = await shopifyClient.request(mutation, { id: priceRuleId })

    if (data.priceRuleDelete.userErrors && data.priceRuleDelete.userErrors.length > 0) {
      throw new Error(data.priceRuleDelete.userErrors[0].message)
    }

    // Invalidate cache
    promotionsCache = null
    lastUpdate = null

    return { success: true, id: data.priceRuleDelete.deletedPriceRuleId }
  } catch (error) {
    console.error(`Error deleting promotion ${id} with alternative method:`, error)
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
  console.log(`Updating promotion ${id} with data:`, data)
  // For now, just return the data as if it was updated
  // In a real implementation, you would call the Shopify API to update the promotion
  return { id, ...data }
}

// Add aliases for compatibility
export const fetchPriceListById = fetchPromotionById
export const createPriceList = createPromotion
export const updatePriceList = updatePromotion
export const fetchPriceLists = fetchPromotions

// Alias para compatibilidad adicional
export const getPriceListById = fetchPromotionById
