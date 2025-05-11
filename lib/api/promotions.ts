import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion, MarketingActivity } from "@/types/promotions"

// Función para obtener todas las promociones
export async function fetchPromotions(limit = 50) {
  try {
    console.log(`Fetching ${limit} promotions from Shopify...`)

    // Consulta para obtener descuentos automáticos
    const automaticQuery = gql`
      query GetAutomaticDiscounts($limit: Int!) {
        automaticDiscountNodes(first: $limit) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticApp {
                  title
                  startsAt
                  endsAt
                  status
                  discountClass
                  summary
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
              }
            }
          }
        }
      }
    `

    // Consulta para obtener descuentos por código
    const codeQuery = gql`
      query GetCodeDiscounts($limit: Int!) {
        codeDiscountNodes(first: $limit) {
          edges {
            node {
              id
              codeDiscount {
                ... on DiscountCodeApp {
                  title
                  startsAt
                  endsAt
                  status
                  discountClass
                  summary
                  codes(first: 5) {
                    edges {
                      node {
                        code
                        id
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
                  codes(first: 5) {
                    edges {
                      node {
                        code
                        id
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
      }
    `

    // Ejecutar ambas consultas en paralelo
    const [automaticData, codeData] = await Promise.all([
      shopifyClient.request(automaticQuery, { limit }),
      shopifyClient.request(codeQuery, { limit }),
    ])

    // Procesar descuentos automáticos
    const automaticPromotions = automaticData.automaticDiscountNodes.edges
      .map((edge: any) => {
        const node = edge.node
        const discount = node.discount

        if (!discount) return null

        // Extraer información común
        const promotion: Partial<Promotion> = {
          id: node.id,
          title: discount.title || "Sin título",
          summary: discount.summary || "",
          startsAt: discount.startsAt,
          endsAt: discount.endsAt,
          status: discount.status,
          discountClass: discount.discountClass || "",
          type: "AUTOMATIC_DISCOUNT",
          value: 0,
          valueType: "",
          currencyCode: "EUR",
          target: "CART",
          active: discount.status === "ACTIVE",
          conditions: [],
        }

        // Extraer valor del descuento si existe
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
            promotion.conditions?.push({
              type: "MINIMUM_AMOUNT",
              value: Number.parseFloat(subtotal.amount),
            })
          } else if (discount.minimumRequirement.greaterThanOrEqualToQuantity) {
            promotion.minimumRequirement = {
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            }
            promotion.conditions?.push({
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            })
          }
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

        return promotion as Promotion
      })
      .filter(Boolean) // Eliminar posibles valores nulos

    // Procesar descuentos por código
    const codePromotions = codeData.codeDiscountNodes.edges
      .map((edge: any) => {
        const node = edge.node
        const discount = node.codeDiscount

        if (!discount) return null

        // Extraer información común
        const promotion: Partial<Promotion> = {
          id: node.id,
          title: discount.title || "Sin título",
          summary: discount.summary || "",
          startsAt: discount.startsAt,
          endsAt: discount.endsAt,
          status: discount.status,
          discountClass: discount.discountClass || "",
          type: "CODE_DISCOUNT",
          value: 0,
          valueType: "",
          currencyCode: "EUR",
          target: "CART",
          active: discount.status === "ACTIVE",
          conditions: [],
        }

        // Extraer código si existe
        if (discount.codes?.edges?.length > 0) {
          promotion.code = discount.codes.edges[0].node.code
          promotion.usageLimit = discount.usageLimit
        }

        // Extraer valor del descuento si existe
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
            promotion.conditions?.push({
              type: "MINIMUM_AMOUNT",
              value: Number.parseFloat(subtotal.amount),
            })
          } else if (discount.minimumRequirement.greaterThanOrEqualToQuantity) {
            promotion.minimumRequirement = {
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            }
            promotion.conditions?.push({
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            })
          }
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

        return promotion as Promotion
      })
      .filter(Boolean) // Eliminar posibles valores nulos

    // Combinar ambos tipos de promociones
    const allPromotions = [...automaticPromotions, ...codePromotions]

    console.log(`Successfully fetched ${allPromotions.length} promotions`)
    return allPromotions
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al cargar promociones: ${error.message}`)
  }
}

// Función para buscar un código de descuento por su código
export async function findDiscountByCode(code: string): Promise<Promotion | null> {
  try {
    const query = gql`
      query GetDiscountByCode($code: String!) {
        codeDiscountNodeByCode(code: $code) {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              summary
              shortSummary
              startsAt
              endsAt
              status
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
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { code })

    if (!data.codeDiscountNodeByCode) {
      return null
    }

    const node = data.codeDiscountNodeByCode
    const discount = node.codeDiscount

    // Crear objeto de promoción
    const promotion: Promotion = {
      id: node.id,
      title: discount.title || "Sin título",
      summary: discount.summary || "",
      shortSummary: discount.shortSummary || "",
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      status: discount.status,
      type: "CODE_DISCOUNT",
      value: 0,
      target: "CART",
      code: code,
      usageLimit: discount.usageLimit,
      active: discount.status === "ACTIVE",
    }

    // Extraer valor del descuento
    if (discount.customerGets?.value) {
      if (discount.customerGets.value.percentage) {
        promotion.value = Number.parseFloat(discount.customerGets.value.percentage)
        promotion.type = "PERCENTAGE_DISCOUNT"
      } else if (discount.customerGets.value.amount) {
        promotion.value = Number.parseFloat(discount.customerGets.value.amount.amount)
        promotion.type = "FIXED_AMOUNT_DISCOUNT"
      }
    }

    return promotion
  } catch (error) {
    console.error("Error finding discount by code:", error)
    return null
  }
}

// Función para obtener actividades de marketing
export async function fetchMarketingActivities(limit = 20): Promise<MarketingActivity[]> {
  try {
    const query = gql`
      query GetMarketingActivities($limit: Int!) {
        marketingActivities(first: $limit) {
          edges {
            node {
              id
              title
              status
              marketingChannel
              createdAt
              updatedAt
              utmParameters {
                campaign
                source
                medium
              }
              budget {
                amount {
                  amount
                  currencyCode
                }
              }
              formData
              remoteUrl
              scheduledStart
              scheduledEnd
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query, { limit })

    if (!data.marketingActivities || !data.marketingActivities.edges) {
      return []
    }

    const activities = data.marketingActivities.edges.map((edge: any) => {
      const node = edge.node

      return {
        id: node.id,
        title: node.title,
        status: node.status,
        type: node.marketingChannel || "UNKNOWN",
        channel: node.marketingChannel || "UNKNOWN",
        startDate: node.scheduledStart || node.createdAt,
        endDate: node.scheduledEnd,
        budget: node.budget?.amount
          ? {
              amount: Number.parseFloat(node.budget.amount.amount),
              currencyCode: node.budget.amount.currencyCode,
            }
          : undefined,
        targetAudience: node.formData ? JSON.parse(node.formData).targetAudience : undefined,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
        },
      } as MarketingActivity
    })

    return activities
  } catch (error) {
    console.error("Error fetching marketing activities:", error)
    return []
  }
}

// Función para crear un código de descuento
export async function createDiscountCode(data: {
  title: string
  code: string
  discountType: string
  value: number
  minimumPurchaseAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  appliesTo?: string
  targetId?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Determinar el tipo de mutación según el tipo de descuento
    let mutation
    const variables: any = {
      basicCodeDiscount: {
        title: data.title,
        code: data.code,
        startsAt: data.startDate || new Date().toISOString(),
        endsAt: data.endDate,
        customerSelection: { all: true },
        customerGets: {
          value: {},
          items: { all: true },
        },
        usageLimit: data.usageLimit,
      },
    }

    // Configurar el valor del descuento
    if (data.discountType === "PERCENTAGE_DISCOUNT") {
      variables.basicCodeDiscount.customerGets.value = { percentage: data.value }
    } else if (data.discountType === "FIXED_AMOUNT_DISCOUNT") {
      variables.basicCodeDiscount.customerGets.value = {
        amount: {
          amount: data.value.toString(),
          currencyCode: "EUR",
        },
      }
    }

    // Configurar el requisito mínimo si existe
    if (data.minimumPurchaseAmount && data.minimumPurchaseAmount > 0) {
      variables.basicCodeDiscount.minimumRequirement = {
        subtotal: {
          greaterThanOrEqualToSubtotal: data.minimumPurchaseAmount,
        },
      }
    }

    // Configurar el objetivo del descuento
    if (data.appliesTo === "PRODUCT" && data.targetId) {
      variables.basicCodeDiscount.customerGets.items = {
        products: { productsToAdd: [data.targetId] },
      }
    } else if (data.appliesTo === "COLLECTION" && data.targetId) {
      variables.basicCodeDiscount.customerGets.items = {
        collections: { collectionsToAdd: [data.targetId] },
      }
    } else {
      variables.basicCodeDiscount.customerGets.items = { all: true }
    }

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

    const result = await shopifyClient.request(mutation, variables)

    if (result.discountCodeBasicCreate.userErrors && result.discountCodeBasicCreate.userErrors.length > 0) {
      return {
        success: false,
        error: result.discountCodeBasicCreate.userErrors[0].message,
      }
    }

    return {
      success: true,
      id: result.discountCodeBasicCreate.codeDiscountNode.id,
    }
  } catch (error) {
    console.error("Error creating discount code:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Función para obtener una promoción por ID
export async function fetchPriceListById(id: string): Promise<Promotion | null> {
  try {
    // Si el ID ya contiene el prefijo gid:/, úsalo directamente
    const fullId = id.includes("gid:/") ? id : `gid:/shopify/DiscountNode/${id}`

    // Intentar primero como descuento automático
    try {
      const automaticQuery = gql`
        query GetAutomaticDiscountById($id: ID!) {
          discountNode(id: $id) {
            id
            discount {
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
                }
              }
            }
          }
        }
      `

      const automaticData = await shopifyClient.request(automaticQuery, { id: fullId })

      if (automaticData.discountNode?.discount) {
        const node = automaticData.discountNode
        const discount = node.discount

        // Crear objeto de promoción
        const promotion: Promotion = {
          id: node.id,
          title: discount.title || "Sin título",
          summary: discount.summary || "",
          startsAt: discount.startsAt,
          endsAt: discount.endsAt,
          status: discount.status,
          type: "AUTOMATIC_DISCOUNT",
          value: 0,
          target: "CART",
          active: discount.status === "ACTIVE",
        }

        // Extraer valor del descuento
        if (discount.customerGets?.value) {
          if (discount.customerGets.value.percentage) {
            promotion.value = Number.parseFloat(discount.customerGets.value.percentage)
            promotion.type = "PERCENTAGE_DISCOUNT"
          } else if (discount.customerGets.value.amount) {
            promotion.value = Number.parseFloat(discount.customerGets.value.amount.amount)
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
          } else if (discount.minimumRequirement.greaterThanOrEqualToQuantity) {
            promotion.minimumRequirement = {
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            }
          }
        }

        return promotion
      }
    } catch (error) {
      console.log("Not an automatic discount, trying code discount...")
    }

    // Intentar como descuento por código
    try {
      const codeQuery = gql`
        query GetCodeDiscountById($id: ID!) {
          codeDiscountNode(id: $id) {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                summary
                startsAt
                endsAt
                status
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
      `

      const codeData = await shopifyClient.request(codeQuery, { id: fullId })

      if (codeData.codeDiscountNode?.codeDiscount) {
        const node = codeData.codeDiscountNode
        const discount = node.codeDiscount

        // Crear objeto de promoción
        const promotion: Promotion = {
          id: node.id,
          title: discount.title || "Sin título",
          summary: discount.summary || "",
          startsAt: discount.startsAt,
          endsAt: discount.endsAt,
          status: discount.status,
          type: "CODE_DISCOUNT",
          value: 0,
          target: "CART",
          active: discount.status === "ACTIVE",
        }

        // Extraer código si existe
        if (discount.codes?.edges?.length > 0) {
          promotion.code = discount.codes.edges[0].node.code
          promotion.usageLimit = discount.usageLimit
        }

        // Extraer valor del descuento
        if (discount.customerGets?.value) {
          if (discount.customerGets.value.percentage) {
            promotion.value = Number.parseFloat(discount.customerGets.value.percentage)
            promotion.type = "PERCENTAGE_DISCOUNT"
          } else if (discount.customerGets.value.amount) {
            promotion.value = Number.parseFloat(discount.customerGets.value.amount.amount)
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
          } else if (discount.minimumRequirement.greaterThanOrEqualToQuantity) {
            promotion.minimumRequirement = {
              type: "MINIMUM_QUANTITY",
              value: discount.minimumRequirement.greaterThanOrEqualToQuantity,
            }
          }
        }

        return promotion
      }
    } catch (error) {
      console.error("Error fetching code discount:", error)
    }

    // Si llegamos aquí, no se encontró la promoción
    throw new Error(`No se encontró la promoción con ID: ${id}`)
  } catch (error) {
    console.error("Error fetching promotion by ID:", error)
    throw new Error(`Error al obtener la promoción: ${error.message}`)
  }
}

// Función para actualizar una promoción
export async function updatePriceList(id: string, data: Partial<Promotion>): Promise<Promotion> {
  try {
    // Si el ID ya contiene el prefijo gid:/, úsalo directamente
    const fullId = id.includes("gid:/") ? id : `gid:/shopify/DiscountNode/${id}`

    // Determinar si es un descuento automático o por código
    const isCodeDiscount = fullId.includes("DiscountCodeNode")

    // Construir las variables para la mutación
    const variables: any = {
      id: fullId,
    }

    if (data.title) variables.title = data.title
    if (data.summary) variables.summary = data.summary
    if (data.startsAt) variables.startsAt = data.startsAt
    if (data.endsAt) variables.endsAt = data.endsAt
    if (data.usageLimit !== undefined) variables.usageLimit = data.usageLimit

    // Seleccionar la mutación adecuada
    const mutation = isCodeDiscount
      ? gql`
        mutation updateCodeDiscount($id: ID!, $title: String, $summary: String, $startsAt: DateTime, $endsAt: DateTime, $usageLimit: Int) {
          discountCodeBasicUpdate(
            id: $id,
            discountCodeBasic: {
              title: $title,
              summary: $summary,
              startsAt: $startsAt,
              endsAt: $endsAt,
              usageLimit: $usageLimit
            }
          ) {
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
      : gql`
        mutation updateAutomaticDiscount($id: ID!, $title: String, $summary: String, $startsAt: DateTime, $endsAt: DateTime) {
          discountAutomaticBasicUpdate(
            id: $id,
            automaticBasicDiscount: {
              title: $title,
              summary: $summary,
              startsAt: $startsAt,
              endsAt: $endsAt
            }
          ) {
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

    const result = await shopifyClient.request(mutation, variables)

    // Verificar errores
    const resultKey = isCodeDiscount ? "discountCodeBasicUpdate" : "discountAutomaticBasicUpdate"
    const userErrors = result[resultKey]?.userErrors

    if (userErrors && userErrors.length > 0) {
      throw new Error(`Error al actualizar la promoción: ${userErrors[0].message}`)
    }

    // Obtener la promoción actualizada
    return await fetchPriceListById(id)
  } catch (error) {
    console.error("Error updating promotion:", error)
    throw new Error(`Error al actualizar la promoción: ${error.message}`)
  }
}

// Función para eliminar una promoción
export async function deletePriceList(id: string): Promise<{ success: boolean; id?: string }> {
  try {
    // Si el ID ya contiene el prefijo gid:/, úsalo directamente
    const fullId = id.includes("gid:/") ? id : `gid:/shopify/DiscountNode/${id}`

    // Determinar si es un descuento automático o por código
    const isCodeDiscount = fullId.includes("DiscountCodeNode")

    // Seleccionar la mutación adecuada
    const mutation = isCodeDiscount
      ? gql`
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
      : gql`
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

    const variables = { id: fullId }
    const result = await shopifyClient.request(mutation, variables)

    // Verificar errores
    const resultKey = isCodeDiscount ? "discountCodeDelete" : "discountAutomaticDelete"
    const userErrors = result[resultKey]?.userErrors

    if (userErrors && userErrors.length > 0) {
      throw new Error(`Error al eliminar la promoción: ${userErrors[0].message}`)
    }

    const deletedId = isCodeDiscount
      ? result.discountCodeDelete.deletedCodeDiscountId
      : result.discountAutomaticDelete.deletedAutomaticDiscountId

    return { success: true, id: deletedId }
  } catch (error) {
    console.error("Error deleting promotion:", error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

// Función para crear una actividad de marketing
export async function createMarketingActivity(data: {
  title: string
  type: string
  channel: string
  startDate: string
  endDate?: string
  budget?: number
  targetAudience?: string
  description?: string
  utmParameters?: {
    campaign?: string
    source?: string
    medium?: string
  }
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const mutation = gql`
      mutation marketingActivityCreate($input: MarketingActivityCreateInput!) {
        marketingActivityCreate(input: $input) {
          marketingActivity {
            id
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
        marketingChannel: data.channel,
        title: data.title,
        status: "SCHEDULED",
        scheduledStart: data.startDate,
        scheduledEnd: data.endDate,
        utmParameters: data.utmParameters || {},
        budget: data.budget
          ? {
              amount: {
                amount: data.budget.toString(),
                currencyCode: "EUR",
              },
            }
          : undefined,
        formData: JSON.stringify({
          description: data.description || "",
          targetAudience: data.targetAudience || "",
        }),
      },
    }

    const result = await shopifyClient.request(mutation, variables)

    if (result.marketingActivityCreate.userErrors && result.marketingActivityCreate.userErrors.length > 0) {
      return {
        success: false,
        error: result.marketingActivityCreate.userErrors[0].message,
      }
    }

    return {
      success: true,
      id: result.marketingActivityCreate.marketingActivity.id,
    }
  } catch (error) {
    console.error("Error creating marketing activity:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Alias para compatibilidad
export const fetchPriceLists = fetchPromotions
export const createPriceList = createDiscountCode
