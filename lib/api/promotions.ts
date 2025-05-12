import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion } from "@/types/promotions"

// Función para obtener todas las promociones
export async function fetchPromotions() {
  try {
    // Consulta actualizada que evita el uso de fragmentos en tipos que no los soportan
    const query = gql`
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              __typename
              discount {
                __typename
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Obtener los IDs de los descuentos
    const discountIds = data.discountNodes.edges.map((edge) => edge.node.id)

    // Obtener los detalles de cada descuento individualmente
    const promotions = await Promise.all(
      discountIds.map(async (id) => {
        try {
          return await fetchPromotionById(id)
        } catch (error) {
          console.error(`Error fetching promotion with ID ${id}:`, error)
          return null
        }
      }),
    )

    // Filtrar los nulos (promociones que fallaron al cargar)
    return promotions.filter(Boolean)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al obtener promociones: ${error.message}`)
  }
}

// Función para obtener una promoción por ID
export async function fetchPromotionById(id) {
  try {
    // Primero determinamos el tipo de descuento
    const typeQuery = gql`
      query GetDiscountType($id: ID!) {
        node(id: $id) {
          id
          __typename
          ... on DiscountNode {
            discount {
              __typename
            }
          }
        }
      }
    `

    const typeData = await shopifyClient.request(typeQuery, { id })
    const discountType = typeData.node?.discount?.__typename

    let promotionData = null

    // Dependiendo del tipo, hacemos la consulta adecuada
    if (discountType === "DiscountAutomatic") {
      const automaticQuery = gql`
        query GetAutomaticDiscount($id: ID!) {
          node(id: $id) {
            id
            ... on DiscountNode {
              discount {
                ... on DiscountAutomatic {
                  __typename
                  title
                  summary
                  status
                  startsAt
                  endsAt
                  ... on DiscountAutomaticBasic {
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
                  ... on DiscountAutomaticBxgy {
                    customerBuys {
                      value {
                        quantity
                      }
                    }
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                      }
                    }
                  }
                  ... on DiscountAutomaticFreeShipping {
                    __typename
                  }
                }
              }
            }
          }
        }
      `
      promotionData = await shopifyClient.request(automaticQuery, { id })
    } else if (discountType === "DiscountCode") {
      const codeQuery = gql`
        query GetCodeDiscount($id: ID!) {
          node(id: $id) {
            id
            ... on DiscountNode {
              discount {
                ... on DiscountCode {
                  __typename
                  title
                  summary
                  status
                  startsAt
                  endsAt
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  ... on DiscountCodeBasic {
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
                  ... on DiscountCodeBxgy {
                    customerBuys {
                      value {
                        quantity
                      }
                    }
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                      }
                    }
                  }
                  ... on DiscountCodeFreeShipping {
                    __typename
                  }
                }
              }
            }
          }
        }
      `
      promotionData = await shopifyClient.request(codeQuery, { id })
    }

    if (!promotionData) {
      throw new Error(`No se pudo obtener información para el descuento con ID ${id}`)
    }

    // Transformar los datos al formato esperado por la aplicación
    return transformPromotionData(id, promotionData.node, discountType)
  } catch (error) {
    console.error(`Error fetching promotion with ID ${id}:`, error)
    throw new Error(`Error al cargar la promoción: ${error.message}`)
  }
}

// Función auxiliar para transformar los datos de la API de Shopify al formato esperado por la aplicación
function transformPromotionData(id, node, discountType) {
  if (!node || !node.discount) {
    throw new Error("Datos de promoción inválidos")
  }

  const discount = node.discount
  const isAutomatic = discountType === "DiscountAutomatic"

  // Extraer valores comunes
  const title = discount.title || ""
  const description = discount.summary || ""
  const status = discount.status || "INACTIVE"
  const startDate = discount.startsAt || new Date().toISOString()
  const endDate = discount.endsAt || null

  // Extraer código si existe
  let code = ""
  if (!isAutomatic && discount.codes?.edges?.length > 0) {
    code = discount.codes.edges[0].node.code || ""
  }

  // Determinar el tipo de promoción y su valor
  let type = "PERCENTAGE_DISCOUNT"
  let value = 0

  if (discount.__typename === "DiscountAutomaticBasic" || discount.__typename === "DiscountCodeBasic") {
    if (discount.customerGets?.value?.percentage) {
      type = "PERCENTAGE_DISCOUNT"
      value = discount.customerGets.value.percentage
    } else if (discount.customerGets?.value?.amount) {
      type = "FIXED_AMOUNT_DISCOUNT"
      value = Number.parseFloat(discount.customerGets.value.amount.amount)
    }
  } else if (discount.__typename === "DiscountAutomaticBxgy" || discount.__typename === "DiscountCodeBxgy") {
    type = "BUY_X_GET_Y"
    value = discount.customerBuys?.value?.quantity || 1
  } else if (
    discount.__typename === "DiscountAutomaticFreeShipping" ||
    discount.__typename === "DiscountCodeFreeShipping"
  ) {
    type = "FREE_SHIPPING"
    value = 0
  }

  return {
    id,
    title,
    description,
    type,
    target: "CART",
    targetId: "",
    value,
    conditions: [],
    active: status === "ACTIVE",
    startDate,
    endDate,
    code,
    usageLimit: 0,
    usageCount: 0,
    createdAt: startDate,
    updatedAt: new Date().toISOString(),
    prices: [],
    isAutomatic,
  }
}

// Funciones para compatibilidad con el código existente
export async function fetchPriceListById(id: string): Promise<Promotion> {
  try {
    const promotion = await fetchPromotionById(id)
    return promotion
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

    return result
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

    // Determinar el tipo de descuento basado en los datos obtenidos
    if (currentPromotion.isAutomatic) {
      discountType = "AUTOMATIC"
    } else {
      if (currentPromotion.type === "BUY_X_GET_Y") {
        type = "BXGY"
      } else if (currentPromotion.type === "FREE_SHIPPING") {
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

    return result
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

    if (promotion.isAutomatic) {
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

    // Obtener los detalles completos de la promoción creada
    return await fetchPromotionById(data.discountCodeBasicCreate.codeDiscountNode.id)
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

    // Obtener los detalles completos de la promoción creada
    return await fetchPromotionById(data.discountCodeBxgyCreate.codeDiscountNode.id)
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

    // Obtener los detalles completos de la promoción creada
    return await fetchPromotionById(data.discountCodeFreeShippingCreate.codeDiscountNode.id)
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

    return await fetchPromotionById(data.discountAutomaticActivate.automaticDiscountNode.id)
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

    return await fetchPromotionById(data.discountCodeActivate.codeDiscountNode.id)
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

    return await fetchPromotionById(data.discountAutomaticDeactivate.automaticDiscountNode.id)
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

    return await fetchPromotionById(data.discountCodeDeactivate.codeDiscountNode.id)
  } catch (error) {
    console.error(`Error deactivating code discount with ID ${id}:`, error)
    throw new Error(`Error al desactivar la promoción: ${error.message}`)
  }
}
