import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchPromotions(limit = 20) {
  try {
    console.log(`Fetching ${limit} promotions from Shopify...`)

    // Consulta actualizada para la API 2023-10 de Shopify
    const query = gql`
      query GetDiscounts($limit: Int!) {
        codeDiscountNodes(first: $limit) {
          edges {
            node {
              id
              codeDiscount {
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
                  usageLimit
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
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
        automaticDiscountNodes(first: $limit) {
          edges {
            node {
              id
              automaticDiscount {
                ... on DiscountAutomaticBasic {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      subtotal {
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

    const data = await shopifyClient.request(query, { limit })

    // Procesar códigos de descuento
    const codeDiscounts =
      data.codeDiscountNodes?.edges
        ?.map((edge: any) => {
          const node = edge.node
          const discount = node.codeDiscount

          if (!discount) return null

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
            usageLimit: discount.usageLimit || null,
          }
        })
        .filter(Boolean) || []

    // Procesar descuentos automáticos
    const automaticDiscounts =
      data.automaticDiscountNodes?.edges
        ?.map((edge: any) => {
          const node = edge.node
          const discount = node.automaticDiscount

          if (!discount) return null

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

          // Extraer el requisito mínimo si existe
          let minimumRequirement = null
          if (discount.minimumRequirement?.subtotal?.amount) {
            minimumRequirement = {
              type: "subtotal",
              value: discount.minimumRequirement.subtotal.amount,
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
        .filter(Boolean) || []

    // Combinar ambos tipos de descuentos
    const promotions = [...codeDiscounts, ...automaticDiscounts]

    console.log(`Successfully fetched ${promotions.length} promotions`)
    return promotions
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al cargar promociones: ${(error as Error).message}`)
  }
}

export async function fetchPromotionById(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/")

    // Determinar si es un descuento automático o un código de descuento
    let isAutomatic = false
    let formattedId = id

    if (!isFullShopifyId) {
      // Intentar primero como código de descuento
      formattedId = `gid://shopify/DiscountCodeNode/${id}`
    } else {
      isAutomatic = id.includes("DiscountAutomaticNode")
    }

    console.log(`Fetching promotion with ID: ${formattedId}`)

    let query

    if (isAutomatic) {
      query = gql`
        query GetAutomaticDiscount($id: ID!) {
          node(id: $id) {
            ... on DiscountAutomaticNode {
              id
              automaticDiscount {
                ... on DiscountAutomaticBasic {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      subtotal {
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
    } else {
      query = gql`
        query GetCodeDiscount($id: ID!) {
          node(id: $id) {
            ... on DiscountCodeNode {
              id
              codeDiscount {
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
                  usageLimit
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
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
    }

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.node) {
      // Si no encontramos con el primer tipo, intentamos con el otro
      if (isAutomatic) {
        formattedId = `gid://shopify/DiscountCodeNode/${id.split("/").pop()}`
      } else {
        formattedId = `gid://shopify/DiscountAutomaticNode/${id.split("/").pop()}`
      }

      isAutomatic = !isAutomatic

      const alternativeQuery = isAutomatic
        ? gql`
          query GetAutomaticDiscount($id: ID!) {
            node(id: $id) {
              ... on DiscountAutomaticNode {
                id
                automaticDiscount {
                  ... on DiscountAutomaticBasic {
                    title
                    summary
                    startsAt
                    endsAt
                    status
                    minimumRequirement {
                      ... on DiscountMinimumSubtotal {
                        subtotal {
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
        : gql`
          query GetCodeDiscount($id: ID!) {
            node(id: $id) {
              ... on DiscountCodeNode {
                id
                codeDiscount {
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
                    usageLimit
                    customerSelection {
                      ... on DiscountCustomerAll {
                        allCustomers
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

      const alternativeData = await shopifyClient.request(alternativeQuery, { id: formattedId })

      if (!alternativeData || !alternativeData.node) {
        console.error(`Promoción no encontrada: ${id}`)
        throw new Error(`Promoción no encontrada: ${id}`)
      }

      data = alternativeData
    }

    const node = data.node

    if (isAutomatic) {
      const discount = node.automaticDiscount

      if (!discount) {
        throw new Error(`Tipo de promoción no soportado: ${id}`)
      }

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

      // Extraer el requisito mínimo si existe
      let minimumRequirement = null
      if (discount.minimumRequirement?.subtotal?.amount) {
        minimumRequirement = {
          type: "subtotal",
          value: discount.minimumRequirement.subtotal.amount,
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
    } else {
      const discount = node.codeDiscount

      if (!discount) {
        throw new Error(`Tipo de promoción no soportado: ${id}`)
      }

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
        usageLimit: discount.usageLimit || null,
      }
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    throw new Error(`Error al cargar la promoción: ${(error as Error).message}`)
  }
}

// Añadir funciones para compatibilidad
export const fetchPriceLists = fetchPromotions
export const fetchPriceListById = fetchPromotionById
export const createPriceList = async (data) => {
  console.warn("createPriceList está obsoleto, usa createPromotion en su lugar")
  return createPromotion(data)
}
export const updatePriceList = async (id, data) => {
  console.warn("updatePriceList está obsoleto, usa updatePromotion en su lugar")
  return { id, ...data }
}
export const deletePriceList = async (id) => {
  console.warn("deletePriceList está obsoleto, usa deletePromotion en su lugar")
  return deletePromotion(id)
}

export async function createPromotion(promotionData) {
  try {
    // Determinar si crear un descuento automático o un código de descuento
    const isAutomatic = !promotionData.code

    let mutation
    let variables

    if (isAutomatic) {
      // Crear un descuento automático
      mutation = gql`
        mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
            automaticDiscountNode {
              id
              automaticDiscount {
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
      // Crear un código de descuento
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
      console.error("Errores al crear promoción:", result.userErrors)
      throw new Error(`Error al crear promoción: ${result.userErrors[0].message}`)
    }

    const resultNode = isAutomatic ? result.automaticDiscountNode : result.codeDiscountNode

    return {
      id: resultNode.id.split("/").pop(),
      title: isAutomatic ? resultNode.automaticDiscount.title : resultNode.codeDiscount.title,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear promoción: ${(error as Error).message}`)
  }
}

export async function deletePromotion(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/")
    let formattedId = id
    let isAutomatic = false

    if (!isFullShopifyId) {
      // Intentar primero como código de descuento
      formattedId = `gid://shopify/DiscountCodeNode/${id}`
    } else {
      isAutomatic = id.includes("DiscountAutomaticNode")
      if (!isAutomatic) {
        formattedId = `gid://shopify/DiscountCodeNode/${id.split("/").pop()}`
      }
    }

    let mutation

    if (isAutomatic) {
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
    } else {
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
    }

    console.log(`Deleting ${isAutomatic ? "automatic" : "code"} discount with ID: ${formattedId}`)

    const data = await shopifyClient.request(mutation, { id: formattedId })

    const result = isAutomatic ? data.discountAutomaticDelete : data.discountCodeDelete

    if (result.userErrors && result.userErrors.length > 0) {
      // Si hay un error, puede ser porque intentamos con el tipo incorrecto
      // Intentar con el otro tipo
      isAutomatic = !isAutomatic

      if (isAutomatic) {
        formattedId = `gid://shopify/DiscountAutomaticNode/${id.split("/").pop()}`
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
      } else {
        formattedId = `gid://shopify/DiscountCodeNode/${id.split("/").pop()}`
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
      }

      console.log(`Retrying deletion with ${isAutomatic ? "automatic" : "code"} discount ID: ${formattedId}`)

      const retryData = await shopifyClient.request(mutation, { id: formattedId })
      const retryResult = isAutomatic ? retryData.discountAutomaticDelete : retryData.discountCodeDelete

      if (retryResult.userErrors && retryResult.userErrors.length > 0) {
        throw new Error(retryResult.userErrors[0].message)
      }

      const deletedId = isAutomatic ? retryResult.deletedAutomaticDiscountId : retryResult.deletedCodeDiscountId
      return { success: true, id: deletedId }
    }

    const deletedId = isAutomatic ? result.deletedAutomaticDiscountId : result.deletedCodeDiscountId
    return { success: true, id: deletedId }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${(error as Error).message}`)
  }
}

// Add the missing function that was causing build errors
export async function createMarketingActivity(activityData: any) {
  try {
    const mutation = gql`
      mutation MarketingActivityCreate($input: MarketingActivityCreateInput!) {
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
        title: activityData.title,
        status: "SCHEDULED",
        formData: JSON.stringify(activityData.formData || {}),
        scheduledAt: activityData.scheduledAt || new Date().toISOString(),
        // Add other required fields based on your needs
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.marketingActivityCreate.userErrors && data.marketingActivityCreate.userErrors.length > 0) {
      throw new Error(data.marketingActivityCreate.userErrors[0].message)
    }

    return data.marketingActivityCreate.marketingActivity
  } catch (error) {
    console.error("Error creating marketing activity:", error)
    throw new Error(`Error al crear actividad de marketing: ${(error as Error).message}`)
  }
}
