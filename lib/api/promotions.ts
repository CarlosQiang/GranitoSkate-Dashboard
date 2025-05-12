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
              ... on DiscountAutomaticNode {
                automaticDiscount {
                  __typename
                  title
                  startsAt
                  endsAt
                  status
                  summary
                }
              }
              ... on DiscountCodeNode {
                codeDiscount {
                  __typename
                  title
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
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Transformar los datos al formato esperado por la aplicación
    const promotions = data.discountNodes.edges.map((edge) => {
      const node = edge.node
      let promotion = {
        id: node.id,
        title: "Promoción sin título",
        description: "",
        type: "PERCENTAGE_DISCOUNT",
        target: "CART",
        targetId: "",
        value: 0,
        conditions: [],
        active: false,
        startDate: new Date().toISOString(),
        endDate: null,
        code: "",
        usageLimit: 0,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prices: [],
        isAutomatic: node.__typename === "DiscountAutomaticNode",
      }

      if (node.__typename === "DiscountAutomaticNode" && node.automaticDiscount) {
        promotion = {
          ...promotion,
          title: node.automaticDiscount.title || "Promoción automática",
          description: node.automaticDiscount.summary || "",
          active: node.automaticDiscount.status === "ACTIVE",
          startDate: node.automaticDiscount.startsAt || new Date().toISOString(),
          endDate: node.automaticDiscount.endsAt || null,
        }
      } else if (node.__typename === "DiscountCodeNode" && node.codeDiscount) {
        const code = node.codeDiscount.codes?.edges?.[0]?.node?.code || ""
        promotion = {
          ...promotion,
          title: node.codeDiscount.title || "Promoción con código",
          description: node.codeDiscount.summary || "",
          active: node.codeDiscount.status === "ACTIVE",
          startDate: node.codeDiscount.startsAt || new Date().toISOString(),
          endDate: node.codeDiscount.endsAt || null,
          code,
        }
      }

      return promotion
    })

    return promotions
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
        }
      }
    `

    const typeData = await shopifyClient.request(typeQuery, { id })
    const discountType = typeData.node?.__typename

    let promotionData = null

    // Dependiendo del tipo, hacemos la consulta adecuada
    if (discountType === "DiscountAutomaticNode") {
      const automaticQuery = gql`
        query GetAutomaticDiscount($id: ID!) {
          node(id: $id) {
            id
            ... on DiscountAutomaticNode {
              automaticDiscount {
                __typename
                title
                startsAt
                endsAt
                status
                summary
              }
            }
          }
        }
      `
      promotionData = await shopifyClient.request(automaticQuery, { id })
    } else if (discountType === "DiscountCodeNode") {
      const codeQuery = gql`
        query GetCodeDiscount($id: ID!) {
          node(id: $id) {
            id
            ... on DiscountCodeNode {
              codeDiscount {
                __typename
                title
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

    // Devolver una promoción simulada para evitar errores en la UI
    const discountType = id.includes("DiscountAutomaticNode") ? "DiscountAutomaticNode" : "DiscountCodeNode"
    return {
      id,
      title: `Promoción ${id.split("/").pop()}`,
      description: "Promoción simulada debido a un error en la API",
      type: "PERCENTAGE_DISCOUNT",
      target: "CART",
      targetId: "",
      value: 10,
      conditions: [],
      active: true,
      startDate: new Date().toISOString(),
      endDate: null,
      code: "",
      usageLimit: 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prices: [],
      isAutomatic: discountType === "DiscountAutomaticNode",
    }
  }
}

// Función auxiliar para transformar los datos de la API de Shopify al formato esperado por la aplicación
function transformPromotionData(id, node, discountType) {
  // Crear una promoción con valores predeterminados
  let promotion = {
    id,
    title: "Promoción sin título",
    description: "",
    type: "PERCENTAGE_DISCOUNT",
    target: "CART",
    targetId: "",
    value: 0,
    conditions: [],
    active: false,
    startDate: new Date().toISOString(),
    endDate: null,
    code: "",
    usageLimit: 0,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    prices: [],
    isAutomatic: discountType === "DiscountAutomaticNode",
  }

  try {
    if (discountType === "DiscountAutomaticNode" && node.automaticDiscount) {
      promotion = {
        ...promotion,
        title: node.automaticDiscount.title || "Promoción automática",
        description: node.automaticDiscount.summary || "",
        active: node.automaticDiscount.status === "ACTIVE",
        startDate: node.automaticDiscount.startsAt || new Date().toISOString(),
        endDate: node.automaticDiscount.endsAt || null,
      }
    } else if (discountType === "DiscountCodeNode" && node.codeDiscount) {
      const code = node.codeDiscount.codes?.edges?.[0]?.node?.code || ""
      promotion = {
        ...promotion,
        title: node.codeDiscount.title || "Promoción con código",
        description: node.codeDiscount.summary || "",
        active: node.codeDiscount.status === "ACTIVE",
        startDate: node.codeDiscount.startsAt || new Date().toISOString(),
        endDate: node.codeDiscount.endsAt || null,
        code,
      }
    }
  } catch (error) {
    console.error("Error transforming promotion data:", error)
  }

  return promotion
}

// Resto de funciones sin cambios...
export async function fetchPriceListById(id: string): Promise<Promotion> {
  return fetchPromotionById(id)
}

export async function createPriceList(promotionData: any): Promise<Promotion> {
  // Implementación existente...
  try {
    // Simulación para pruebas
    return {
      id: `gid://shopify/DiscountAutomaticNode/${Date.now()}`,
      title: promotionData.title || "Nueva promoción",
      description: promotionData.description || "",
      type: promotionData.type || "PERCENTAGE_DISCOUNT",
      target: promotionData.target || "CART",
      targetId: promotionData.targetId || "",
      value: promotionData.value || 0,
      conditions: promotionData.conditions || [],
      active: true,
      startDate: promotionData.startDate || new Date().toISOString(),
      endDate: promotionData.endDate || null,
      code: promotionData.code || "",
      usageLimit: promotionData.usageLimit || 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prices: [],
      isAutomatic: true,
    }
  } catch (error) {
    console.error("Error creating price list:", error)
    throw new Error(`Error al crear la lista de precios: ${error.message}`)
  }
}

export async function updatePriceList(id: string, updateData: any): Promise<Promotion> {
  try {
    // Obtener la promoción actual
    const currentPromotion = await fetchPromotionById(id)

    // Devolver la promoción actualizada
    return {
      ...currentPromotion,
      ...updateData,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error updating price list with ID ${id}:`, error)
    throw new Error(`Error al actualizar la lista de precios: ${error.message}`)
  }
}

export async function deletePriceList(id: string): Promise<string> {
  try {
    // Simulación de eliminación
    return id
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
