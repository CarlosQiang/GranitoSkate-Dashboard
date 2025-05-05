import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchPromotions(limit = 20) {
  try {
    console.log(`Fetching ${limit} promotions from Shopify...`)

    // Consulta actualizada para ser compatible con la estructura actual de la API de Shopify
    const query = gql`
      query GetDiscountCodes($limit: Int!) {
        discountNodes(first: $limit) {
          edges {
            node {
              id
              discount {
                __typename
                ... on DiscountAutomaticApp {
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
                }
                ... on DiscountAutomaticBasic {
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
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                        currencyCode
                      }
                    }
                    ... on DiscountMinimumQuantity {
                      greaterThanOrEqualToQuantity
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
                    items {
                      ... on DiscountProducts {
                        products {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        allItems
                      }
                    }
                  }
                }
                ... on DiscountAutomaticBxgy {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  discountClass
                }
                ... on DiscountAutomaticFreeShipping {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  discountClass
                }
                ... on DiscountCodeApp {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  discountClass
                  usageLimit
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                }
                ... on DiscountCodeBasic {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  discountClass
                  usageLimit
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
                    items {
                      ... on DiscountProducts {
                        products {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        allItems
                      }
                    }
                  }
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                        currencyCode
                      }
                    }
                    ... on DiscountMinimumQuantity {
                      greaterThanOrEqualToQuantity
                    }
                  }
                }
                ... on DiscountCodeBxgy {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  discountClass
                  usageLimit
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                }
                ... on DiscountCodeFreeShipping {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  discountClass
                  usageLimit
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

    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.discountNodes || !data.discountNodes.edges) {
      console.error("Respuesta de promociones incompleta:", data)
      return []
    }

    const promotions = data.discountNodes.edges
      .map((edge: any) => {
        const node = edge.node
        const discount = node.discount

        if (!discount) return null

        // Determinar el tipo de descuento
        const discountType = discount.__typename

        // Extraer información común
        const promotion = {
          id: node.id,
          title: discount.title || "Sin título",
          summary: discount.summary || "",
          startsAt: discount.startsAt,
          endsAt: discount.endsAt,
          status: discount.status,
          discountClass: discount.discountClass || "",
          type: "",
          value: 0,
          valueType: "",
          currencyCode: "EUR",
          code: null,
          usageLimit: null,
          minimumRequirement: null,
          target: "CART",
          active: discount.status === "ACTIVE",
          conditions: [],
        }

        // Extraer código si existe
        if (discountType.includes("Code") && discount.codes?.edges?.length > 0) {
          promotion.code = discount.codes.edges[0].node.code
          promotion.usageLimit = discount.usageLimit
        }

        // Extraer valor del descuento
        if (discount.customerGets?.value) {
          if (discount.customerGets.value.percentage) {
            promotion.value = Number.parseFloat(discount.customerGets.value.percentage)
            promotion.valueType = "PERCENTAGE_DISCOUNT"
            promotion.type = "PERCENTAGE_DISCOUNT"
          } else if (discount.customerGets.value.amount) {
            promotion.value = Number.parseFloat(discount.customerGets.value.amount.amount)
            promotion.currencyCode = discount.customerGets.value.amount.currencyCode
            promotion.valueType = "FIXED_AMOUNT_DISCOUNT"
            promotion.type = "FIXED_AMOUNT_DISCOUNT"
          }
        }

        // Extraer requisito mínimo
        if (discount.minimumRequirement) {
          if (discount.minimumRequirement.greaterThanOrEqualToSubtotal) {
            const subtotal = discount.minimumRequirement.greaterThanOrEqualToSubtotal
            promotion.minimumRequirement = {
              type: "MINIMUM_AMOUNT",
              value: Number.parseFloat(subtotal.amount),
            }
            promotion.conditions.push({
              type: "MINIMUM_AMOUNT",
              value: Number.parseFloat(subtotal.amount),
            })
          } else if (discount.minimumRequirement.greaterThanOrEqualToQuantity) {
            promotion.minimumRequirement = {
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            }
            promotion.conditions.push({
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            })
          }
        }

        // Determinar el tipo específico de descuento
        if (discountType.includes("FreeShipping")) {
          promotion.type = "FREE_SHIPPING"
          promotion.valueType = "FREE_SHIPPING"
        } else if (discountType.includes("Bxgy")) {
          promotion.type = "BUY_X_GET_Y"
          promotion.valueType = "BUY_X_GET_Y"
        }

        // Determinar el objetivo del descuento
        if (discount.customerGets?.items) {
          if (discount.customerGets.items.allItems) {
            promotion.target = "CART"
          } else if (discount.customerGets.items.products) {
            promotion.target = "PRODUCT"
            // Aquí podrías extraer los IDs de productos si es necesario
          }
        }

        return promotion
      })
      .filter(Boolean) // Eliminar posibles valores nulos

    console.log(`Successfully fetched ${promotions.length} promotions`)
    return promotions
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al cargar promociones: ${error.message}`)
  }
}

export async function fetchPromotionById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/DiscountNode/${id}`

    console.log(`Fetching promotion with ID: ${formattedId}`)

    // Consulta similar a fetchPromotions pero para un solo descuento
    const query = gql`
      query GetDiscountNode($id: ID!) {
        node(id: $id) {
          ... on DiscountNode {
            id
            discount {
              __typename
              ... on DiscountAutomaticApp {
                title
                summary
                startsAt
                endsAt
                status
                discountClass
              }
              ... on DiscountAutomaticBasic {
                title
                summary
                startsAt
                endsAt
                status
                discountClass
                minimumRequirement {
                  ... on DiscountMinimumSubtotal {
                    greaterThanOrEqualToSubtotal {
                      amount
                      currencyCode
                    }
                  }
                  ... on DiscountMinimumQuantity {
                    greaterThanOrEqualToQuantity
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
                  items {
                    ... on DiscountProducts {
                      products {
                        edges {
                          node {
                            id
                            title
                          }
                        }
                      }
                    }
                    ... on AllDiscountItems {
                      allItems
                    }
                  }
                }
              }
              ... on DiscountCodeBasic {
                title
                summary
                startsAt
                endsAt
                status
                discountClass
                usageLimit
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
                  items {
                    ... on DiscountProducts {
                      products {
                        edges {
                          node {
                            id
                            title
                          }
                        }
                      }
                    }
                    ... on AllDiscountItems {
                      allItems
                    }
                  }
                }
                minimumRequirement {
                  ... on DiscountMinimumSubtotal {
                    greaterThanOrEqualToSubtotal {
                      amount
                      currencyCode
                    }
                  }
                  ... on DiscountMinimumQuantity {
                    greaterThanOrEqualToQuantity
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.node || !data.node.discount) {
      console.error(`Promoción no encontrada: ${id}`)
      throw new Error(`Promoción no encontrada: ${id}`)
    }

    const node = data.node
    const discount = node.discount
    const discountType = discount.__typename

    // Construir objeto de promoción similar a fetchPromotions
    const promotion = {
      id: node.id,
      title: discount.title || "Sin título",
      summary: discount.summary || "",
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      status: discount.status,
      discountClass: discount.discountClass || "",
      type: "",
      value: 0,
      valueType: "",
      currencyCode: "EUR",
      code: null,
      usageLimit: null,
      minimumRequirement: null,
      target: "CART",
      active: discount.status === "ACTIVE",
      conditions: [],
    }

    // Extraer código si existe
    if (discountType.includes("Code") && discount.codes?.edges?.length > 0) {
      promotion.code = discount.codes.edges[0].node.code
      promotion.usageLimit = discount.usageLimit
    }

    // Extraer valor del descuento
    if (discount.customerGets?.value) {
      if (discount.customerGets.value.percentage) {
        promotion.value = Number.parseFloat(discount.customerGets.value.percentage)
        promotion.valueType = "PERCENTAGE_DISCOUNT"
        promotion.type = "PERCENTAGE_DISCOUNT"
      } else if (discount.customerGets.value.amount) {
        promotion.value = Number.parseFloat(discount.customerGets.value.amount.amount)
        promotion.currencyCode = discount.customerGets.value.amount.currencyCode
        promotion.valueType = "FIXED_AMOUNT_DISCOUNT"
        promotion.type = "FIXED_AMOUNT_DISCOUNT"
      }
    }

    // Extraer requisito mínimo
    if (discount.minimumRequirement) {
      if (discount.minimumRequirement.greaterThanOrEqualToSubtotal) {
        const subtotal = discount.minimumRequirement.greaterThanOrEqualToSubtotal
        promotion.minimumRequirement = {
          type: "MINIMUM_AMOUNT",
          value: Number.parseFloat(subtotal.amount),
        }
        promotion.conditions.push({
          type: "MINIMUM_AMOUNT",
          value: Number.parseFloat(subtotal.amount),
        })
      } else if (discount.minimumRequirement.greaterThanOrEqualToQuantity) {
        promotion.minimumRequirement = {
          type: "MINIMUM_QUANTITY",
          value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
        }
        promotion.conditions.push({
          type: "MINIMUM_QUANTITY",
          value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
        })
      }
    }

    // Determinar el tipo específico de descuento
    if (discountType.includes("FreeShipping")) {
      promotion.type = "FREE_SHIPPING"
      promotion.valueType = "FREE_SHIPPING"
    } else if (discountType.includes("Bxgy")) {
      promotion.type = "BUY_X_GET_Y"
      promotion.valueType = "BUY_X_GET_Y"
    }

    // Determinar el objetivo del descuento
    if (discount.customerGets?.items) {
      if (discount.customerGets.items.allItems) {
        promotion.target = "CART"
      } else if (discount.customerGets.items.products) {
        promotion.target = "PRODUCT"
        // Aquí podrías extraer los IDs de productos si es necesario
      }
    }

    return promotion
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error al cargar la promoción: ${error.message}`)
  }
}

export async function createPromotion(promotionData) {
  try {
    // Determinar si crear un descuento automático o un código de descuento
    const isAutomatic = !promotionData.code

    let mutation
    let variables

    if (isAutomatic) {
      // Crear un descuento automático básico
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

      // Preparar variables para la mutación
      const discountInput = {
        title: promotionData.title,
        startsAt: promotionData.startDate || new Date().toISOString(),
        endsAt: promotionData.endDate,
        customerGets: {
          value: {},
          items: { all: true },
        },
        minimumRequirement: null,
      }

      // Configurar el valor del descuento
      if (promotionData.type === "PERCENTAGE_DISCOUNT") {
        discountInput.customerGets.value = { percentage: promotionData.value.toString() }
      } else if (promotionData.type === "FIXED_AMOUNT_DISCOUNT") {
        discountInput.customerGets.value = {
          amount: {
            amount: promotionData.value.toString(),
            currencyCode: "EUR",
          },
        }
      }

      // Configurar el requisito mínimo si existe
      if (promotionData.minimumPurchase && Number.parseFloat(promotionData.minimumPurchase) > 0) {
        discountInput.minimumRequirement = {
          subtotal: {
            greaterThanOrEqualToAmount: {
              amount: promotionData.minimumPurchase,
              currencyCode: "EUR",
            },
          },
        }
      }

      variables = {
        automaticBasicDiscount: discountInput,
      }
    } else {
      // Crear un código de descuento básico
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

      // Preparar variables para la mutación
      const discountInput = {
        title: promotionData.title,
        code: promotionData.code,
        startsAt: promotionData.startDate || new Date().toISOString(),
        endsAt: promotionData.endDate,
        customerSelection: { all: true },
        customerGets: {
          value: {},
          items: { all: true },
        },
        minimumRequirement: null,
        usageLimit: promotionData.usageLimit ? Number.parseInt(promotionData.usageLimit) : null,
      }

      // Configurar el valor del descuento
      if (promotionData.type === "PERCENTAGE_DISCOUNT") {
        discountInput.customerGets.value = { percentage: promotionData.value.toString() }
      } else if (promotionData.type === "FIXED_AMOUNT_DISCOUNT") {
        discountInput.customerGets.value = {
          amount: {
            amount: promotionData.value.toString(),
            currencyCode: "EUR",
          },
        }
      }

      // Configurar el requisito mínimo si existe
      if (promotionData.minimumPurchase && Number.parseFloat(promotionData.minimumPurchase) > 0) {
        discountInput.minimumRequirement = {
          subtotal: {
            greaterThanOrEqualToAmount: {
              amount: promotionData.minimumPurchase,
              currencyCode: "EUR",
            },
          },
        }
      }

      variables = {
        basicCodeDiscount: discountInput,
      }
    }

    console.log(`Creating ${isAutomatic ? "automatic" : "code"} promotion:`, JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)

    const result = isAutomatic ? data.discountAutomaticBasicCreate : data.discountCodeBasicCreate

    if (result.userErrors && result.userErrors.length > 0) {
      console.error("Errores al crear promoción:", result.userErrors)
      throw new Error(`Error al crear promoción: ${result.userErrors[0].message}`)
    }

    const resultNode = isAutomatic ? result.automaticDiscountNode : result.codeDiscountNode

    return {
      id: resultNode.id,
      title: promotionData.title,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear promoción: ${error.message}`)
  }
}

export async function updatePromotion(id, updateData) {
  try {
    // Primero necesitamos obtener la promoción actual para saber su tipo
    const promotion = await fetchPromotionById(id)
    const isCode = promotion.code !== null

    let mutation
    let variables

    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/DiscountNode/${id}`

    if (isCode) {
      // Actualizar código de descuento
      mutation = gql`
        mutation discountCodeBasicUpdate($id: ID!, $codeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicUpdate(id: $id, codeDiscount: $codeDiscount) {
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

      // Preparar los datos de actualización
      const updateFields = {}

      if (updateData.title) updateFields.title = updateData.title
      if (updateData.endDate !== undefined) updateFields.endsAt = updateData.endDate
      if (updateData.usageLimit !== undefined) updateFields.usageLimit = updateData.usageLimit

      variables = {
        id: formattedId,
        codeDiscount: updateFields,
      }
    } else {
      // Actualizar descuento automático
      mutation = gql`
        mutation discountAutomaticBasicUpdate($id: ID!, $automaticDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicUpdate(id: $id, automaticDiscount: $automaticDiscount) {
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

      // Preparar los datos de actualización
      const updateFields = {}

      if (updateData.title) updateFields.title = updateData.title
      if (updateData.endDate !== undefined) updateFields.endsAt = updateData.endDate

      variables = {
        id: formattedId,
        automaticDiscount: updateFields,
      }
    }

    console.log(`Updating ${isCode ? "code" : "automatic"} promotion:`, JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)

    const result = isCode ? data.discountCodeBasicUpdate : data.discountAutomaticBasicUpdate

    if (result.userErrors && result.userErrors.length > 0) {
      console.error("Errores al actualizar promoción:", result.userErrors)
      throw new Error(`Error al actualizar promoción: ${result.userErrors[0].message}`)
    }

    return {
      id: id,
      ...updateData,
    }
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error)
    throw new Error(`Error al actualizar la promoción: ${error.message}`)
  }
}

export async function deletePromotion(id) {
  try {
    // Primero necesitamos obtener la promoción actual para saber su tipo
    const promotion = await fetchPromotionById(id)
    const isCode = promotion.code !== null

    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/DiscountNode/${id}`

    let mutation
    let variables

    if (isCode) {
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

    variables = { id: formattedId }

    console.log(`Deleting ${isCode ? "code" : "automatic"} promotion with ID: ${formattedId}`)

    const data = await shopifyClient.request(mutation, variables)

    const result = isCode ? data.discountCodeDelete : data.discountAutomaticDelete

    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message)
    }

    const deletedId = isCode ? result.deletedCodeDiscountId : result.deletedAutomaticDiscountId

    return { success: true, id: deletedId }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

// Añadir funciones para compatibilidad
export const fetchPriceLists = fetchPromotions
export const fetchPriceListById = fetchPromotionById
export const createPriceList = createPromotion
export const updatePriceList = updatePromotion
export const deletePriceList = deletePromotion
