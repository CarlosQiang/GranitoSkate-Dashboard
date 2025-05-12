import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion } from "@/types/promotions"

// Función para obtener todas las promociones
export async function fetchPromotions() {
  try {
    const query = gql`
      query {
        codeDiscountNodes(first: 50) {
          edges {
            node {
              id
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
    `

    const data = await shopifyClient.request(query)
    return data.codeDiscountNodes.edges.map((edge) => edge.node)
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
        codeDiscountNode(id: $id) {
          id
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
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)
    return data.codeDiscountNode
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

    if (currentPromotion.codeDiscount.__typename === "DiscountCodeBxgy") {
      type = "BXGY"
    } else if (currentPromotion.codeDiscount.__typename === "DiscountCodeFreeShipping") {
      type = "FREE_SHIPPING"
    }

    // Preparar los datos de actualización según el tipo
    const updatePayload = {
      title: updateData.title,
      endsAt: updateData.endDate,
    }

    // Actualizar la promoción
    const result = await updatePromotion(id, updatePayload, type)

    return transformPromotionData(result)
  } catch (error) {
    console.error(`Error updating price list with ID ${id}:`, error)
    throw new Error(`Error al actualizar la lista de precios: ${error.message}`)
  }
}

export async function deletePriceList(id: string): Promise<string> {
  try {
    const result = await deletePromotion(id)
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

  const codeDiscount = shopifyPromotion.codeDiscount || {}
  const code = codeDiscount.codes?.edges[0]?.node?.code || ""

  let type = "PERCENTAGE_DISCOUNT"
  let value = 0

  if (codeDiscount.__typename === "DiscountCodeBasic") {
    if (codeDiscount.customerGets?.value?.percentage) {
      type = "PERCENTAGE_DISCOUNT"
      value = codeDiscount.customerGets.value.percentage
    } else if (codeDiscount.customerGets?.value?.amount) {
      type = "FIXED_AMOUNT_DISCOUNT"
      value = Number.parseFloat(codeDiscount.customerGets.value.amount.amount)
    }
  } else if (codeDiscount.__typename === "DiscountCodeBxgy") {
    type = "BUY_X_GET_Y"
    value = codeDiscount.customerBuys?.value?.quantity || 1
  } else if (codeDiscount.__typename === "DiscountCodeFreeShipping") {
    type = "FREE_SHIPPING"
    value = 0
  }

  return {
    id: shopifyPromotion.id,
    title: codeDiscount.title || "",
    description: codeDiscount.summary || "",
    type,
    target: "CART",
    targetId: "",
    value,
    conditions: [],
    active: codeDiscount.status === "ACTIVE",
    startDate: codeDiscount.startsAt || new Date().toISOString(),
    endDate: codeDiscount.endsAt,
    code,
    usageLimit: 0,
    usageCount: 0,
    createdAt: codeDiscount.startsAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    prices: [],
  }
}

// Función para crear una nueva promoción de descuento básico
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
      basicCodeDiscount: discountData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBasicCreate.userErrors[0].message)
    }

    return data.discountCodeBasicCreate.codeDiscountNode
  } catch (error) {
    console.error("Error creating basic discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para crear una nueva promoción de compra X, obtén Y
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
      bxgyCodeDiscount: discountData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBxgyCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBxgyCreate.userErrors[0].message)
    }

    return data.discountCodeBxgyCreate.codeDiscountNode
  } catch (error) {
    console.error("Error creating BXGY discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para crear una nueva promoción de envío gratuito
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
      freeShippingCodeDiscount: discountData,
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeFreeShippingCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeFreeShippingCreate.userErrors[0].message)
    }

    return data.discountCodeFreeShippingCreate.codeDiscountNode
  } catch (error) {
    console.error("Error creating free shipping discount:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

// Función para actualizar una promoción
export async function updatePromotion(id, discountData, type = "BASIC") {
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

    return data[resultKey].codeDiscountNode
  } catch (error) {
    console.error(`Error updating promotion with ID ${id}:`, error)
    throw new Error(`Error al actualizar la promoción: ${error.message}`)
  }
}

// Función para eliminar una promoción
export async function deletePromotion(id) {
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
    console.error(`Error deleting promotion with ID ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

// Función para activar una promoción
export async function activatePromotion(id) {
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
    console.error(`Error activating promotion with ID ${id}:`, error)
    throw new Error(`Error al activar la promoción: ${error.message}`)
  }
}

// Función para desactivar una promoción
export async function deactivatePromotion(id) {
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
    console.error(`Error deactivating promotion with ID ${id}:`, error)
    throw new Error(`Error al desactivar la promoción: ${error.message}`)
  }
}
