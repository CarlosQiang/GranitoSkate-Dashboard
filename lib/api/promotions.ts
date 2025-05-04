import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchPromotions(limit = 20) {
  try {
    console.log(`Fetching ${limit} promotions from Shopify...`)

    const query = gql`
      query GetDiscountCodes($limit: Int!) {
        discountNodes(first: $limit) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticNode {
                  automaticDiscount {
                    title
                    summary
                    startsAt
                    endsAt
                    status
                    minimumRequirement {
                      ... on DiscountMinimumSubtotal {
                        greaterThanOrEqualToSubtotal {
                          amount
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
                ... on DiscountCodeNode {
                  codeDiscount {
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
        }
      }
    `

    const data = await shopifyClient.request(query, { limit })

    if (!data || !data.discountNodes || !data.discountNodes.edges) {
      console.error("Respuesta de promociones incompleta:", data)
      return []
    }

    const promotions = data.discountNodes.edges
      .map((edge) => {
        const node = edge.node
        const discount = node.discount

        // Determinar si es un descuento automático o un código de descuento
        const isAutomatic = !!discount.automaticDiscount
        const discountData = isAutomatic ? discount.automaticDiscount : discount.codeDiscount

        if (!discountData) return null

        // Extraer el código si es un código de descuento
        const code = !isAutomatic && discountData.codes?.edges?.[0]?.node?.code

        // Extraer el valor del descuento
        let value = "0"
        let valueType = "percentage"
        let currencyCode = "EUR"

        if (discountData.customerGets?.value?.percentage) {
          value = discountData.customerGets.value.percentage
          valueType = "percentage"
        } else if (discountData.customerGets?.value?.amount?.amount) {
          value = discountData.customerGets.value.amount.amount
          valueType = "fixed_amount"
          currencyCode = discountData.customerGets.value.amount.currencyCode || "EUR"
        }

        // Extraer el requisito mínimo si existe
        let minimumRequirement = null
        if (discountData.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
          minimumRequirement = {
            type: "subtotal",
            value: discountData.minimumRequirement.greaterThanOrEqualToSubtotal.amount,
          }
        }

        return {
          id: node.id.split("/").pop(),
          title: discountData.title,
          code: code || null,
          isAutomatic: isAutomatic,
          startsAt: discountData.startsAt,
          endsAt: discountData.endsAt,
          status: discountData.status,
          valueType: valueType,
          value: value,
          currencyCode: currencyCode,
          minimumRequirement: minimumRequirement,
          usageLimit: discountData.usageLimit || null,
          summary: discountData.summary || null,
        }
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

    const query = gql`
      query GetDiscountNode($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            ... on DiscountAutomat  {
        discountNode(id: $id) {
          id
          discount {
            ... on DiscountAutomaticNode {
              automaticDiscount {
                title
                summary
                startsAt
                endsAt
                status
                minimumRequirement {
                  ... on DiscountMinimumSubtotal {
                    greaterThanOrEqualToSubtotal {
                      amount
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
            ... on DiscountCodeNode {
              codeDiscount {
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

    const data = await shopifyClient.request(query, { id: formattedId })

    if (!data || !data.discountNode) {
      console.error(`Promoción no encontrada: ${id}`)
      throw new Error(`Promoción no encontrada: ${id}`)
    }

    const node = data.discountNode
    const discount = node.discount

    // Determinar si es un descuento automático o un código de descuento
    const isAutomatic = !!discount.automaticDiscount
    const discountData = isAutomatic ? discount.automaticDiscount : discount.codeDiscount

    if (!discountData) {
      throw new Error(`Tipo de promoción no soportado: ${id}`)
    }

    // Extraer el código si es un código de descuento
    const code = !isAutomatic && discountData.codes?.edges?.[0]?.node?.code

    // Extraer el valor del descuento
    let value = "0"
    let valueType = "percentage"
    let currencyCode = "EUR"

    if (discountData.customerGets?.value?.percentage) {
      value = discountData.customerGets.value.percentage
      valueType = "percentage"
    } else if (discountData.customerGets?.value?.amount?.amount) {
      value = discountData.customerGets.value.amount.amount
      valueType = "fixed_amount"
      currencyCode = discountData.customerGets.value.amount.currencyCode || "EUR"
    }

    // Extraer el requisito mínimo si existe
    let minimumRequirement = null
    if (discountData.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
      minimumRequirement = {
        type: "subtotal",
        value: discountData.minimumRequirement.greaterThanOrEqualToSubtotal.amount,
      }
    }

    return {
      id: node.id.split("/").pop(),
      title: discountData.title,
      code: code || null,
      isAutomatic: isAutomatic,
      startsAt: discountData.startsAt,
      endsAt: discountData.endsAt,
      status: discountData.status,
      valueType: valueType,
      value: value,
      currencyCode: currencyCode,
      minimumRequirement: minimumRequirement,
      usageLimit: discountData.usageLimit || null,
      summary: discountData.summary || null,
    }
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
      // Crear un descuento automático
      mutation = gql`
        mutation discountAutomaticCreate($automaticDiscount: DiscountAutomaticInput!) {
          discountAutomaticCreate(automaticDiscount: $automaticDiscount) {
            automaticDiscountNode {
              id
              automaticDiscount {
                title
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
        automaticDiscount: {
          title: promotionData.title,
          startsAt: promotionData.startsAt || new Date().toISOString(),
          endsAt: promotionData.endsAt,
          customerGets: {
            value:
              promotionData.valueType === "percentage"
                ? { percentage: Number.parseFloat(promotionData.value) }
                : { amount: { amount: promotionData.value, currencyCode: promotionData.currencyCode || "EUR" } },
            items: { all: true },
          },
          minimumRequirement: promotionData.minimumRequirement
            ? { subtotal: { greaterThanOrEqualToAmount: promotionData.minimumRequirement.value } }
            : { subtotal: { greaterThanOrEqualToAmount: "0.00" } },
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
                title
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
                : { amount: { amount: promotionData.value, currencyCode: promotionData.currencyCode || "EUR" } },
            items: { all: true },
          },
          usageLimit: promotionData.usageLimit || null,
        },
      }
    }

    console.log(`Creating ${isAutomatic ? "automatic" : "code"} promotion:`, JSON.stringify(variables, null, 2))

    const data = await shopifyClient.request(mutation, variables)

    const result = isAutomatic ? data.discountAutomaticCreate : data.discountCodeBasicCreate

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
    throw new Error(`Error al crear promoción: ${error.message}`)
  }
}

export async function deletePromotion(id) {
  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = id.includes("gid://shopify/")
    const formattedId = isFullShopifyId ? id : `gid://shopify/DiscountNode/${id}`

    // Primero necesitamos determinar si es un descuento automático o un código de descuento
    const query = gql`
      query GetDiscountType($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            __typename
          }
        }
      }
    `

    const typeData = await shopifyClient.request(query, { id: formattedId })

    if (!typeData || !typeData.discountNode || !typeData.discountNode.discount) {
      throw new Error(`Promoción no encontrada: ${id}`)
    }

    const discountType = typeData.discountNode.discount.__typename

    let mutation
    let variables

    if (discountType === "DiscountAutomaticNode") {
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
      variables = { id: formattedId }
    } else if (discountType === "DiscountCodeNode") {
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
      variables = { id: formattedId }
    } else {
      throw new Error(`Tipo de promoción no soportado: ${discountType}`)
    }

    console.log(`Deleting ${discountType} with ID: ${formattedId}`)

    const data = await shopifyClient.request(mutation, variables)

    const result = discountType === "DiscountAutomaticNode" ? data.discountAutomaticDelete : data.discountCodeDelete

    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message)
    }

    const deletedId =
      discountType === "DiscountAutomaticNode" ? result.deletedAutomaticDiscountId : result.deletedCodeDiscountId

    return { success: true, id: deletedId }
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}
