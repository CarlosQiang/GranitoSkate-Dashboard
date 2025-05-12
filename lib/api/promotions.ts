import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion } from "@/types/promotions"

// Función para obtener todas las promociones usando discountnodes
export async function fetchPromotions() {
  try {
    const query = gql`
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticNode {
                  automaticDiscount {
                    title
                    summary
                    status
                    startsAt
                    endsAt
                    minimumRequirement {
                      ... on DiscountMinimumSubtotal {
                        subtotal {
                          amount
                          currencyCode
                        }
                      }
                      ... on DiscountMinimumQuantity {
                        quantity
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
                          products(first: 5) {
                            edges {
                              node {
                                id
                                title
                              }
                            }
                          }
                        }
                        ... on DiscountCollections {
                          collections(first: 5) {
                            edges {
                              node {
                                id
                                title
                              }
                            }
                          }
                        }
                        ... on AllDiscountItems {
                          all
                        }
                      }
                    }
                  }
                }
                ... on DiscountCodeNode {
                  codeDiscount {
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
                      customerSelection {
                        all
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
                            products(first: 5) {
                              edges {
                                node {
                                  id
                                  title
                                }
                              }
                            }
                          }
                          ... on DiscountCollections {
                            collections(first: 5) {
                              edges {
                                node {
                                  id
                                  title
                                }
                              }
                            }
                          }
                          ... on AllDiscountItems {
                            all
                          }
                        }
                      }
                    }
                    ... on DiscountCodeBxgy {
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
                      customerSelection {
                        all
                      }
                      customerBuys {
                        value {
                          quantity
                        }
                        items {
                          ... on DiscountProducts {
                            products(first: 5) {
                              edges {
                                node {
                                  id
                                  title
                                }
                              }
                            }
                          }
                          ... on DiscountCollections {
                            collections(first: 5) {
                              edges {
                                node {
                                  id
                                  title
                                }
                              }
                            }
                          }
                          ... on AllDiscountItems {
                            all
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
                            products(first: 5) {
                              edges {
                                node {
                                  id
                                  title
                                }
                              }
                            }
                          }
                          ... on DiscountCollections {
                            collections(first: 5) {
                              edges {
                                node {
                                  id
                                  title
                                }
                              }
                            }
                          }
                          ... on AllDiscountItems {
                            all
                          }
                        }
                      }
                    }
                    ... on DiscountCodeFreeShipping {
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
                      customerSelection {
                        all
                      }
                      destinationSelection {
                        all
                      }
                      minimumRequirement {
                        ... on DiscountMinimumSubtotal {
                          subtotal {
                            amount
                            currencyCode
                          }
                        }
                        ... on DiscountMinimumQuantity {
                          quantity
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
    return data.discountNodes.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al cargar promociones: ${error.message}`)
  }
}

// Función para obtener una promoción por ID
export async function fetchPromotionById(id) {
  try {
    const query = gql`
      query GetPromotion($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            ... on DiscountAutomaticNode {
              automaticDiscount {
                title
                summary
                status
                startsAt
                endsAt
                minimumRequirement {
                  ... on DiscountMinimumSubtotal {
                    subtotal {
                      amount
                      currencyCode
                    }
                  }
                  ... on DiscountMinimumQuantity {
                    quantity
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
                      products(first: 20) {
                        edges {
                          node {
                            id
                            title
                          }
                        }
                      }
                    }
                    ... on DiscountCollections {
                      collections(first: 20) {
                        edges {
                          node {
                            id
                            title
                          }
                        }
                      }
                    }
                    ... on AllDiscountItems {
                      all
                    }
                  }
                }
              }
            }
            ... on DiscountCodeNode {
              codeDiscount {
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
                  customerSelection {
                    all
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
                        products(first: 20) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on DiscountCollections {
                        collections(first: 20) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        all
                      }
                    }
                  }
                }
                ... on DiscountCodeBxgy {
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
                  customerSelection {
                    all
                  }
                  customerBuys {
                    value {
                      quantity
                    }
                    items {
                      ... on DiscountProducts {
                        products(first: 20) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on DiscountCollections {
                        collections(first: 20) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        all
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
                        products(first: 20) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on DiscountCollections {
                        collections(first: 20) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                      ... on AllDiscountItems {
                        all
                      }
                    }
                  }
                }
                ... on DiscountCodeFreeShipping {
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
                  customerSelection {
                    all
                  }
                  destinationSelection {
                    all
                  }
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      subtotal {
                        amount
                        currencyCode
                      }
                    }
                    ... on DiscountMinimumQuantity {
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)
    return data.discountNode
  } catch (error) {
    console.error(`Error fetching promotion with ID ${id}:`, error)
    throw new Error(`Error al cargar la promoción: ${error.message}`)
  }
}

// Funciones para compatibilidad con el código existente
export async function fetchPriceListById(id: string): Promise<Promotion> {
  try {
    const promotion = await fetchPromotionById(id)
    // Convertir el formato de la API de Shopify al formato esperado por la aplicación
    return transformPromotionData(promotion)
  } catch (error) {
    console.error(`Error fetching price list with ID ${id}:`, error)
    throw new Error(`Error al cargar la lista de precios: ${error.message}`)
  }
}

export async function createPriceList(promotionData: any): Promise<Promotion> {
  try {
    // Determinar el tipo de descuento y llamar a la función correspondiente
    let result
    if (promotionData.type === "PERCENTAGE_DISCOUNT") {
      result = await createBasicDiscount({
        title: promotionData.title,
        startsAt: promotionData.startDate,
        endsAt: promotionData.endDate,
        code: promotionData.code,
        customerGets: {
          value: {
            percentage: promotionData.value,
          },
          items: {
            all: true,
          },
        },
      })
    } else if (promotionData.type === "FIXED_AMOUNT_DISCOUNT") {
      result = await createBasicDiscount({
        title: promotionData.title,
        startsAt: promotionData.startDate,
        endsAt: promotionData.endDate,
        code: promotionData.code,
        customerGets: {
          value: {
            amount: {
              amount: promotionData.value,
              currencyCode: "EUR",
            },
          },
          items: {
            all: true,
          },
        },
      })
    } else if (promotionData.type === "BUY_X_GET_Y") {
      result = await createBxgyDiscount({
        title: promotionData.title,
        startsAt: promotionData.startDate,
        endsAt: promotionData.endDate,
        code: promotionData.code,
        customerBuys: {
          value: {
            quantity: promotionData.conditions[0]?.value || 1,
          },
          items: {
            all: true,
          },
        },
        customerGets: {
          value: {
            percentage: 100,
          },
          items: {
            all: true,
          },
        },
      })
    } else if (promotionData.type === "FREE_SHIPPING") {
      result = await createFreeShippingDiscount({
        title: promotionData.title,
        startsAt: promotionData.startDate,
        endsAt: promotionData.endDate,
        code: promotionData.code,
        destinationSelection: {
          all: true,
        },
      })
    }

    return transformPromotionData(result)
  } catch (error) {
    console.error("Error creating price list:", error)
    throw new Error(`Error al crear la lista de precios: ${error.message}`)
  }
}

export async function updatePriceList(id: string, updateData: any): Promise<Promotion> {
  try {
    // Obtener la promoción actual para determinar su tipo
    const currentPromotion = await fetchPromotionById(id)
    let type = "BASIC"
    let discountType = "CODE"

    if (currentPromotion.discount.__typename === "DiscountAutomaticNode") {
      discountType = "AUTOMATIC"
    } else if (currentPromotion.discount.__typename === "DiscountCodeNode") {
      const codeDiscount = currentPromotion.discount.codeDiscount
      if (codeDiscount.__typename === "DiscountCodeBxgy") {
        type = "BXGY"
      } else if (codeDiscount.__typename === "DiscountCodeFreeShipping") {
        type = "FREE_SHIPPING"
      }
    }

    // Preparar los datos de actualización según el tipo
    const updatePayload = {
      title: updateData.title,
      endsAt: updateData.endDate,
    }

    // Actualizar la promoción
    let result
    if (discountType === "AUTOMATIC") {
      result = await updateAutomaticDiscount(id, updatePayload)
    } else {
      result = await updateCodeDiscount(id, updatePayload, type)
    }

    return transformPromotionData(result)
  } catch (error) {
    console.error(`Error updating price list with ID ${id}:`, error)
    throw new Error(`Error al actualizar la lista de precios: ${error.message}`)
  }
}

export async function deletePriceList(id: string): Promise<string> {
  try {
    // Determinar si es un descuento automático o de código
    const promotion = await fetchPromotionById(id)
    let result

    if (promotion.discount.__typename === "DiscountAutomaticNode") {
      result = await deleteAutomaticDiscount(id)
    } else {
      result = await deleteCodeDiscount(id)
    }

    return result
  } catch (error) {
    console.error(`Error deleting price list with ID ${id}:`, error)
    throw new Error(`Error al eliminar la lista de precios: ${error.message}`)
  }
}

// Función auxiliar para transformar los datos de la API de Shopify al formato esperado por la aplicación
function transformPromotionData(shopifyPromotion: any): Promotion {
  if (!shopifyPromotion) {
    throw new Error("Datos de promoción inválidos")
  }

  const discount = shopifyPromotion.discount || {}
  let discountDetails
  let isAutomatic = false
  let code = ""

  if (discount.__typename === "DiscountAutomaticNode") {
    discountDetails = discount.automaticDiscount
    isAutomatic = true
  } else if (discount.__typename === "DiscountCodeNode") {
    discountDetails = discount.codeDiscount
    code = discountDetails.codes?.edges[0]?.node?.code || ""
  } else {
    discountDetails = {}
  }

  let type = "PERCENTAGE_DISCOUNT"
  let value = 0

  if (discountDetails.__typename === "DiscountCodeBasic" || discountDetails.__typename === "DiscountAutomaticBasic") {
    if (discountDetails.customerGets?.value?.percentage) {
      type = "PERCENTAGE_DISCOUNT"
      value = discountDetails.customerGets.value.percentage
    } else if (discountDetails.customerGets?.value?.amount) {
      type = "FIXED_AMOUNT_DISCOUNT"
      value = Number.parseFloat(discountDetails.customerGets.value.amount.amount)
    }
  } else if (
    discountDetails.__typename === "DiscountCodeBxgy" ||
    discountDetails.__typename === "DiscountAutomaticBxgy"
  ) {
    type = "BUY_X_GET_Y"
    value = discountDetails.customerBuys?.value?.quantity || 1
  } else if (
    discountDetails.__typename === "DiscountCodeFreeShipping" ||
    discountDetails.__typename === "DiscountAutomaticFreeShipping"
  ) {
    type = "FREE_SHIPPING"
    value = 0
  }

  return {
    id: shopifyPromotion.id,
    title: discountDetails.title || "",
    description: discountDetails.summary || "",
    type,
    target: "CART",
    targetId: "",
    value,
    conditions: [],
    active: discountDetails.status === "ACTIVE",
    startDate: discountDetails.startsAt || new Date().toISOString(),
    endDate: discountDetails.endsAt,
    code,
    usageLimit: 0,
    usageCount: 0,
    createdAt: discountDetails.startsAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    prices: [],
    isAutomatic,
  }
}

// Función para crear un descuento básico con código
export async function createBasicDiscount(discountData) {
  try {
    const mutation = gql`
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
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
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      basicCodeDiscount: {
        ...discountData,
        codes: [{ code: discountData.code }],
      },
    }

    // Eliminar el código del objeto principal para evitar duplicación
    delete variables.basicCodeDiscount.code

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBasicCreate.userErrors[0].message)
    }

    return {
      id: data.discountCodeBasicCreate.codeDiscountNode.id,
      discount: {
        __typename: "DiscountCodeNode",
        codeDiscount: data.discountCodeBasicCreate.codeDiscountNode.codeDiscount,
      },
    }
  } catch (error) {
    console.error("Error creating basic discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para crear un descuento de compra X, obtén Y con código
export async function createBxgyDiscount(discountData) {
  try {
    const mutation = gql`
      mutation discountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
        discountCodeBxgyCreate(bxgyCodeDiscount: $bxgyCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBxgy {
                title
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
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      bxgyCodeDiscount: {
        ...discountData,
        codes: [{ code: discountData.code }],
      },
    }

    // Eliminar el código del objeto principal para evitar duplicación
    delete variables.bxgyCodeDiscount.code

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBxgyCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBxgyCreate.userErrors[0].message)
    }

    return {
      id: data.discountCodeBxgyCreate.codeDiscountNode.id,
      discount: {
        __typename: "DiscountCodeNode",
        codeDiscount: data.discountCodeBxgyCreate.codeDiscountNode.codeDiscount,
      },
    }
  } catch (error) {
    console.error("Error creating BXGY discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para crear un descuento de envío gratuito con código
export async function createFreeShippingDiscount(discountData) {
  try {
    const mutation = gql`
      mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
        discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeFreeShipping {
                title
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
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      freeShippingCodeDiscount: {
        ...discountData,
        codes: [{ code: discountData.code }],
      },
    }

    // Eliminar el código del objeto principal para evitar duplicación
    delete variables.freeShippingCodeDiscount.code

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeFreeShippingCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeFreeShippingCreate.userErrors[0].message)
    }

    return {
      id: data.discountCodeFreeShippingCreate.codeDiscountNode.id,
      discount: {
        __typename: "DiscountCodeNode",
        codeDiscount: data.discountCodeFreeShippingCreate.codeDiscountNode.codeDiscount,
      },
    }
  } catch (error) {
    console.error("Error creating free shipping discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para actualizar un descuento automático
export async function updateAutomaticDiscount(id, discountData) {
  try {
    const mutation = gql`
      mutation discountAutomaticBasicUpdate($id: ID!, $automaticBasicDiscount: DiscountAutomaticBasicInput!) {
        discountAutomaticBasicUpdate(id: $id, automaticBasicDiscount: $automaticBasicDiscount) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                title
                status
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

    const variables = {
      id,
      automaticBasicDiscount: discountData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountAutomaticBasicUpdate.userErrors.length > 0) {
      throw new Error(data.discountAutomaticBasicUpdate.userErrors[0].message)
    }

    // Obtener los detalles actualizados
    return await fetchPromotionById(id)
  } catch (error) {
    console.error(`Error updating automatic discount with ID ${id}:`, error)
    throw new Error(`Error al actualizar la promoción: ${error.message}`)
  }
}

// Función para actualizar un descuento con código
export async function updateCodeDiscount(id, discountData, type = "BASIC") {
  try {
    let mutation
    let variables

    if (type === "BASIC") {
      mutation = gql`
        mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
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
        id,
        basicCodeDiscount: discountData,
      }
    } else if (type === "BXGY") {
      mutation = gql`
        mutation discountCodeBxgyUpdate($id: ID!, $bxgyCodeDiscount: DiscountCodeBxgyInput!) {
          discountCodeBxgyUpdate(id: $id, bxgyCodeDiscount: $bxgyCodeDiscount) {
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
        id,
        bxgyCodeDiscount: discountData,
      }
    } else if (type === "FREE_SHIPPING") {
      mutation = gql`
        mutation discountCodeFreeShippingUpdate($id: ID!, $freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
          discountCodeFreeShippingUpdate(id: $id, freeShippingCodeDiscount: $freeShippingCodeDiscount) {
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
        id,
        freeShippingCodeDiscount: discountData,
      }
    } else {
      throw new Error("Tipo de promoción no válido")
    }

    const data = await shopifyClient.request(mutation, variables)

    const resultKey = `discountCode${type.charAt(0) + type.slice(1).toLowerCase()}Update`

    if (data[resultKey].userErrors.length > 0) {
      throw new Error(data[resultKey].userErrors[0].message)
    }

    // Obtener los detalles actualizados
    return await fetchPromotionById(id)
  } catch (error) {
    console.error(`Error updating code discount with ID ${id}:`, error)
    throw new Error(`Error al actualizar la promoción: ${error.message}`)
  }
}

// Función para eliminar un descuento automático
export async function deleteAutomaticDiscount(id) {
  try {
    const mutation = gql`
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountAutomaticDelete.userErrors.length > 0) {
      throw new Error(data.discountAutomaticDelete.userErrors[0].message)
    }

    return data.discountAutomaticDelete.deletedAutomaticDiscountId
  } catch (error) {
    console.error(`Error deleting automatic discount with ID ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

// Función para eliminar un descuento con código
export async function deleteCodeDiscount(id) {
  try {
    const mutation = gql`
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeDelete.userErrors.length > 0) {
      throw new Error(data.discountCodeDelete.userErrors[0].message)
    }

    return data.discountCodeDelete.deletedCodeDiscountId
  } catch (error) {
    console.error(`Error deleting code discount with ID ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

// Función para activar un descuento automático
export async function activateAutomaticDiscount(id) {
  try {
    const mutation = gql`
      mutation discountAutomaticActivate($id: ID!) {
        discountAutomaticActivate(id: $id) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                status
              }
              ... on DiscountAutomaticBxgy {
                status
              }
              ... on DiscountAutomaticFreeShipping {
                status
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountAutomaticActivate.userErrors.length > 0) {
      throw new Error(data.discountAutomaticActivate.userErrors[0].message)
    }

    return data.discountAutomaticActivate.automaticDiscountNode
  } catch (error) {
    console.error(`Error activating automatic discount with ID ${id}:`, error)
    throw new Error(`Error al activar la promoción: ${error.message}`)
  }
}

// Función para activar un descuento con código
export async function activateCodeDiscount(id) {
  try {
    const mutation = gql`
      mutation discountCodeActivate($id: ID!) {
        discountCodeActivate(id: $id) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                status
              }
              ... on DiscountCodeBxgy {
                status
              }
              ... on DiscountCodeFreeShipping {
                status
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeActivate.userErrors.length > 0) {
      throw new Error(data.discountCodeActivate.userErrors[0].message)
    }

    return data.discountCodeActivate.codeDiscountNode
  } catch (error) {
    console.error(`Error activating code discount with ID ${id}:`, error)
    throw new Error(`Error al activar la promoción: ${error.message}`)
  }
}

// Función para desactivar un descuento automático
export async function deactivateAutomaticDiscount(id) {
  try {
    const mutation = gql`
      mutation discountAutomaticDeactivate($id: ID!) {
        discountAutomaticDeactivate(id: $id) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                status
              }
              ... on DiscountAutomaticBxgy {
                status
              }
              ... on DiscountAutomaticFreeShipping {
                status
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountAutomaticDeactivate.userErrors.length > 0) {
      throw new Error(data.discountAutomaticDeactivate.userErrors[0].message)
    }

    return data.discountAutomaticDeactivate.automaticDiscountNode
  } catch (error) {
    console.error(`Error deactivating automatic discount with ID ${id}:`, error)
    throw new Error(`Error al desactivar la promoción: ${error.message}`)
  }
}

// Función para desactivar un descuento con código
export async function deactivateCodeDiscount(id) {
  try {
    const mutation = gql`
      mutation discountCodeDeactivate($id: ID!) {
        discountCodeDeactivate(id: $id) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                status
              }
              ... on DiscountCodeBxgy {
                status
              }
              ... on DiscountCodeFreeShipping {
                status
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

    const variables = {
      id,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeDeactivate.userErrors.length > 0) {
      throw new Error(data.discountCodeDeactivate.userErrors[0].message)
    }

    return data.discountCodeDeactivate.codeDiscountNode
  } catch (error) {
    console.error(`Error deactivating code discount with ID ${id}:`, error)
    throw new Error(`Error al desactivar la promoción: ${error.message}`)
  }
}
