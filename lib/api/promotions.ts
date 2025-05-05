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

export async function fetchPriceListById(id: string): Promise<Promotion | null> {
  try {
    // Si el ID ya contiene el prefijo gid:/, úsalo directamente
    const fullId = id.includes("gid:/") ? id : `gid:/shopify/DiscountAutomaticNode/${id}`

    const query = `
      query GetPriceRuleById($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            ... on DiscountAutomaticApp {
              title
              discountClass
              startsAt
              endsAt
              status
              summary
              combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
              }
              customerGets {
                items {
                  ... on DiscountProducts {
                    products(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
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
              customerBuys {
                items {
                  ... on DiscountProducts {
                    products(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                }
                minimumQuantity
                minimumPurchaseAmount {
                  amount
                  currencyCode
                }
              }
              usageLimit
              usesPerOrderLimit
              usageCount
            }
            ... on DiscountCodeApp {
              title
              discountClass
              startsAt
              endsAt
              status
              summary
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
              }
              customerGets {
                items {
                  ... on DiscountProducts {
                    products(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
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
              customerBuys {
                items {
                  ... on DiscountProducts {
                    products(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                }
                minimumQuantity
                minimumPurchaseAmount {
                  amount
                  currencyCode
                }
              }
              usageLimit
              usesPerOrderLimit
              usageCount
            }
          }
        }
      }
    `

    try {
      const response = await shopifyFetch({
        query,
        variables: { id: fullId },
      })

      // Verificar si la respuesta es válida
      if (!response || !response.data) {
        console.error("Respuesta vacía o inválida de Shopify:", response)
        return null
      }

      // Verificar si se encontró el nodo de descuento
      if (!response.data.discountNode) {
        console.error(`No se encontró el nodo de descuento con ID: ${id}`)
        return null
      }

      // Verificar si el nodo tiene un descuento
      if (!response.data.discountNode.discount) {
        console.error(`El nodo de descuento con ID: ${id} no tiene un descuento asociado`)
        return null
      }

      const discountData = response.data.discountNode.discount
      const isCodeDiscount = "codes" in discountData

      // Mapear los datos de la API a nuestro modelo de Promotion
      const promotion: Promotion = {
        id: response.data.discountNode.id,
        title: discountData.title || "Sin título",
        status: discountData.status || "UNKNOWN",
        startsAt: discountData.startsAt,
        endsAt: discountData.endsAt,
        summary: discountData.summary || "",
        type: getDiscountType(discountData),
        value: getDiscountValue(discountData),
        target: getDiscountTarget(discountData),
        targetId: getDiscountTargetId(discountData),
        code: isCodeDiscount && discountData.codes?.edges?.[0]?.node?.code,
        usageLimit: discountData.usageLimit,
        usageCount: discountData.usageCount,
        minimumRequirement: getMinimumRequirement(discountData),
      }

      return promotion
    } catch (error) {
      // Si hay un error en la consulta, intentar con otro formato de ID
      if (id.includes("gid:/")) {
        // Si ya estamos usando el ID completo, intentar con solo el número
        const numericId = id.split("/").pop()
        console.log(`Intentando con ID numérico: ${numericId}`)

        // Intentar con otro tipo de nodo
        const alternativeId = `gid:/shopify/DiscountCodeNode/${numericId}`

        try {
          const response = await shopifyFetch({
            query,
            variables: { id: alternativeId },
          })

          if (response?.data?.discountNode?.discount) {
            const discountData = response.data.discountNode.discount
            const isCodeDiscount = "codes" in discountData

            const promotion: Promotion = {
              id: response.data.discountNode.id,
              title: discountData.title || "Sin título",
              status: discountData.status || "UNKNOWN",
              startsAt: discountData.startsAt,
              endsAt: discountData.endsAt,
              summary: discountData.summary || "",
              type: getDiscountType(discountData),
              value: getDiscountValue(discountData),
              target: getDiscountTarget(discountData),
              targetId: getDiscountTargetId(discountData),
              code: isCodeDiscount && discountData.codes?.edges?.[0]?.node?.code,
              usageLimit: discountData.usageLimit,
              usageCount: discountData.usageCount,
              minimumRequirement: getMinimumRequirement(discountData),
            }

            return promotion
          }
        } catch (alternativeError) {
          console.error("Error con ID alternativo:", alternativeError)
        }
      } else {
        // Si estamos usando solo el número, intentar con el ID completo
        console.log("El ID original no es un gid, no se intentará con formato alternativo")
      }

      console.error("Error fetching price rule by ID:", error)
      throw new Error(`No se encontró la promoción con ID: ${id}`)
    }
  } catch (error) {
    console.error("Error fetching price rule by ID:", error)
    throw new Error(`Error al obtener la promoción: ${(error as Error).message}`)
  }
}

// Añade estas funciones auxiliares si no existen:

function getDiscountType(discountData: any): string {
  if (discountData.customerGets?.value?.percentage) {
    return "PERCENTAGE_DISCOUNT"
  } else if (discountData.customerGets?.value?.amount) {
    return "FIXED_AMOUNT_DISCOUNT"
  } else if (discountData.discountClass === "SHIPPING") {
    return "SHIPPING_DISCOUNT"
  } else if (discountData.customerBuys?.minimumQuantity && discountData.customerGets) {
    return "BUY_X_GET_Y"
  }
  return "OTHER"
}

function getDiscountValue(discountData: any): number | string {
  if (discountData.customerGets?.value?.percentage) {
    return discountData.customerGets.value.percentage
  } else if (discountData.customerGets?.value?.amount?.amount) {
    return Number.parseFloat(discountData.customerGets.value.amount.amount)
  } else if (discountData.customerBuys?.minimumQuantity && discountData.customerGets) {
    // Para promociones de tipo "compra X lleva Y"
    return discountData.customerGets.items ? "1" : "0" // Simplificado
  }
  return 0
}

function getDiscountTarget(discountData: any): string {
  if (discountData.customerGets?.items) {
    const items = discountData.customerGets.items
    if (items.products) return "PRODUCT"
    if (items.collections) return "COLLECTION"
  }
  return "CART"
}

function getDiscountTargetId(discountData: any): string | undefined {
  if (discountData.customerGets?.items) {
    const items = discountData.customerGets.items
    if (items.products && items.products.edges && items.products.edges.length > 0) {
      return items.products.edges[0].node.id
    }
    if (items.collections && items.collections.edges && items.collections.edges.length > 0) {
      return items.collections.edges[0].node.id
    }
  }
  return undefined
}

function getMinimumRequirement(discountData: any): { type: string; value: number | string } | undefined {
  if (discountData.customerBuys?.minimumPurchaseAmount?.amount) {
    return {
      type: "MINIMUM_AMOUNT",
      value: Number.parseFloat(discountData.customerBuys.minimumPurchaseAmount.amount),
    }
  } else if (discountData.customerBuys?.minimumQuantity) {
    return {
      type: "MINIMUM_QUANTITY",
      value: discountData.customerBuys.minimumQuantity,
    }
  }
  return undefined
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
        discountInput.customerGets.value = { percentage: Number.parseFloat(promotionData.value) }
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
            greaterThanOrEqualToSubtotal: Number.parseFloat(promotionData.minimumPurchase),
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
        discountInput.customerGets.value = { percentage: Number.parseFloat(promotionData.value) }
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
            greaterThanOrEqualToSubtotal: Number.parseFloat(promotionData.minimumPurchase),
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

async function fetchPromotionById(id: string): Promise<any> {
  try {
    const query = gql`
      query GetDiscountNode($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            __typename
            ... on DiscountAutomaticBasic {
              title
              startsAt
              endsAt
              status
            }
            ... on DiscountCodeBasic {
              title
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
            }
          }
        }
      }
    `

    const variables = { id: id }
    const data = await shopifyClient.request(query, variables)

    if (!data || !data.discountNode) {
      throw new Error(`Could not fetch discount with ID: ${id}`)
    }

    const discountNode = data.discountNode
    const discount = discountNode.discount

    if (!discount) {
      throw new Error(`Discount not found for ID: ${id}`)
    }

    const promotion = {
      id: discountNode.id,
      title: discount.title,
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      status: discount.status,
      code: null,
    }

    if (discount.__typename === "DiscountCodeBasic") {
      promotion.code = discount.codes?.edges?.[0]?.node?.code || null
    }

    return promotion
  } catch (error) {
    console.error(`Error fetching promotion by ID ${id}:`, error)
    throw new Error(`Error fetching promotion by ID ${id}: ${error.message}`)
  }
}

export async function updatePriceList(id: string, data: Partial<Promotion>): Promise<Promotion> {
  // Si el ID ya contiene el prefijo gid:/, úsalo directamente
  const fullId = id.includes("gid:/") ? id : `gid:/shopify/DiscountAutomaticNode/${id}`

  // Construir las variables para la mutación según los datos proporcionados
  const variables: any = {
    id: fullId,
  }

  if (data.title) variables.title = data.title
  if (data.startsAt) variables.startsAt = data.startsAt
  if (data.endsAt) variables.endsAt = data.endsAt
  if (data.summary) variables.summary = data.summary

  // Determinar qué tipo de descuento es para usar la mutación correcta
  const isCodeDiscount = fullId.includes("DiscountCodeNode")

  const mutation = isCodeDiscount
    ? `
      mutation updateCodeDiscount($id: ID!, $title: String, $startsAt: DateTime, $endsAt: DateTime, $summary: String) {
        discountCodeAppUpdate(
          id: $id,
          discountCodeApp: {
            title: $title,
            startsAt: $startsAt,
            endsAt: $endsAt,
            summary: $summary
          }
        ) {
          codeDiscountApp {
            id
            title
            startsAt
            endsAt
            summary
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `
    : `
      mutation updateAutomaticDiscount($id: ID!, $title: String, $startsAt: DateTime, $endsAt: DateTime, $summary: String) {
        discountAutomaticAppUpdate(
          id: $id,
          automaticAppDiscount: {
            title: $title,
            startsAt: $startsAt,
            endsAt: $endsAt,
            summary: $summary
          }
        ) {
          automaticDiscountApp {
            id
            title
            startsAt
            endsAt
            summary
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `

  try {
    const response = await shopifyFetch({
      query: mutation,
      variables,
    })

    // Verificar errores
    const responseKey = isCodeDiscount ? "discountCodeAppUpdate" : "discountAutomaticAppUpdate"
    const userErrors = response.data?.[responseKey]?.userErrors

    if (userErrors && userErrors.length > 0) {
      throw new Error(`Error al actualizar la promoción: ${userErrors[0].message}`)
    }

    // Obtener la promoción actualizada
    return await fetchPriceListById(id)
  } catch (error) {
    console.error("Error updating price rule:", error)
    throw new Error(`Error al actualizar la promoción: ${(error as Error).message}`)
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
export const deletePriceList = deletePromotion

import { shopifyFetch } from "./shopifyFetch"

interface Promotion {
  id: string
  title: string
  status: string
  startsAt: string
  endsAt: string
  summary: string
  type: string
  value: number | string
  target: string
  targetId?: string
  code?: string
  usageLimit?: number
  usageCount?: number
  minimumRequirement?: {
    type: string
    value: number | string
  }
}

export const createPriceList = createPromotion
