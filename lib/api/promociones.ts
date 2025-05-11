import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let promocionesCache = null
let ultimaActualizacion = null
const CACHE_DURACION = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene todas las promociones (alias para compatibilidad)
 * @returns Lista de promociones
 */
export const obtenerListasPrecios = obtenerPromociones

/**
 * Obtiene todas las promociones
 * @returns Lista de promociones
 */
export async function obtenerPromociones(limit = 20) {
  try {
    // Usar caché si existe y tiene menos de 5 minutos
    const ahora = new Date()
    if (promocionesCache && ultimaActualizacion && ahora.getTime() - ultimaActualizacion.getTime() < CACHE_DURACION) {
      console.log("Usando caché de promociones")
      return promocionesCache
    }

    console.log(`Obteniendo ${limit} promociones de Shopify...`)

    // Consulta para la API de Shopify 2023-07
    const query = gql`
      query GetDiscountNodes($limit: Int!) {
        discountNodes(first: $limit) {
          edges {
            node {
              id
              discount {
                __typename
                ... on DiscountAutomatic {
                  title
                  summary
                  startsAt
                  endsAt
                  status
                  minimumRequirement {
                    __typename
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                        currencyCode
                      }
                    }
                  }
                  customerGets {
                    value {
                      __typename
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
                ... on DiscountCode {
                  title
                  codeCount
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
                    __typename
                    ... on DiscountCustomerAll {
                      allCustomers
                    }
                  }
                  customerGets {
                    value {
                      __typename
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

    if (!data || !data.discountNodes || !data.discountNodes.edges) {
      console.error("Respuesta de promociones incompleta:", data)
      return []
    }

    const promotions = data.discountNodes.edges
      .map((edge) => {
        const node = edge.node
        const discount = node.discount
        const discountType = discount.__typename

        // Determinar si es un descuento automático o un código de descuento
        const isAutomatic = discountType === "DiscountAutomatic"
        const discountData = isAutomatic ? discount : discount

        if (!discountData) return null

        // Extraer el código si es un código de descuento
        const code = !isAutomatic && discount.codes?.edges?.[0]?.node?.code

        // Extraer el valor del descuento
        let value = "0"
        let valueType = "percentage"
        const currencyCode = "EUR"

        if (discountData.customerGets?.value?.percentage) {
          value = discountData.customerGets.value.percentage
          valueType = "percentage"
        } else if (discountData.customerGets?.value?.amount?.amount) {
          value = discountData.customerGets.value.amount.amount
          valueType = "fixed_amount"
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

    // Actualizar caché
    promocionesCache = promotions
    ultimaActualizacion = new Date()

    console.log(`Se obtuvieron ${promotions.length} promociones correctamente`)
    return promotions
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    throw new Error(`Error al cargar promociones: ${error.message}`)
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción o null si no existe
 */
export async function obtenerPromocionPorId(id) {
  try {
    // Consulta para obtener una promoción específica
    const query = gql`
      query GetDiscountNode($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            __typename
            ... on DiscountAutomatic {
              title
              summary
              startsAt
              endsAt
              status
              minimumRequirement {
                __typename
                ... on DiscountMinimumSubtotal {
                  greaterThanOrEqualToSubtotal {
                    amount
                    currencyCode
                  }
                }
              }
              customerGets {
                value {
                  __typename
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
            ... on DiscountCode {
              title
              codeCount
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
                __typename
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              customerGets {
                value {
                  __typename
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

    const data = await shopifyClient.request(query, { id: `gid://shopify/DiscountNode/${id}` })

    if (!data || !data.discountNode) {
      throw new Error(`Promoción no encontrada: ${id}`)
    }

    const node = data.discountNode
    const discount = node.discount
    const discountType = discount.__typename

    // Determinar si es un descuento automático o un código de descuento
    const isAutomatic = discountType === "DiscountAutomatic"
    const discountData = isAutomatic ? discount : discount

    // Extraer el código si es un código de descuento
    const code = !isAutomatic && discount.codes?.edges?.[0]?.node?.code

    // Extraer el valor del descuento
    let value = "0"
    let valueType = "percentage"
    const currencyCode = "EUR"

    if (discountData.customerGets?.value?.percentage) {
      value = discountData.customerGets.value.percentage
      valueType = "percentage"
    } else if (discountData.customerGets?.value?.amount?.amount) {
      value = discountData.customerGets.value.amount.amount
      valueType = "fixed_amount"
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
    console.error(`Error al obtener promoción ${id}:`, error)
    throw new Error(`Error al cargar la promoción: ${error.message}`)
  }
}

/**
 * Crea una nueva promoción
 * @param datos Datos de la promoción a crear
 * @returns La promoción creada
 */
export async function crearPromocion(promotionData) {
  try {
    // Determinar si es un código de descuento o un descuento automático
    const isCodeDiscount = !!promotionData.code

    let mutation
    let variables

    if (isCodeDiscount) {
      // Crear un código de descuento
      mutation = gql`
        mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              id
              codeDiscount {
                title
                codes(first: 1) {
                  edges {
                    node {
                      code
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

      variables = {
        basicCodeDiscount: {
          title: promotionData.title,
          code: promotionData.code,
          startsAt: promotionData.startsAt || new Date().toISOString(),
          endsAt: promotionData.endsAt,
          customerSelection: {
            all: true,
          },
          customerGets: {
            value: {
              percentage: Number.parseFloat(promotionData.value),
            },
          },
          // Añadir más campos según sea necesario
        },
      }
    } else {
      // Crear un descuento automático
      mutation = gql`
        mutation DiscountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
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
        automaticBasicDiscount: {
          title: promotionData.title,
          startsAt: promotionData.startsAt || new Date().toISOString(),
          endsAt: promotionData.endsAt,
          customerSelection: {
            all: true,
          },
          customerGets: {
            value: {
              percentage: Number.parseFloat(promotionData.value),
            },
          },
          // Añadir más campos según sea necesario
        },
      }
    }

    const data = await shopifyClient.request(mutation, variables)

    // Verificar errores
    const userErrors = isCodeDiscount
      ? data.discountCodeBasicCreate.userErrors
      : data.discountAutomaticBasicCreate.userErrors

    if (userErrors && userErrors.length > 0) {
      throw new Error(`Error al crear promoción: ${userErrors[0].message}`)
    }

    // Obtener el ID de la promoción creada
    const discountNode = isCodeDiscount
      ? data.discountCodeBasicCreate.codeDiscountNode
      : data.discountAutomaticBasicCreate.automaticDiscountNode

    // Invalidar caché
    promocionesCache = null
    ultimaActualizacion = null

    return {
      id: discountNode.id.split("/").pop(),
      title: promotionData.title,
      // Otros campos según sea necesario
    }
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw new Error(`Error al crear promoción: ${error.message}`)
  }
}

/**
 * Actualiza una promoción existente
 * @param id ID de la promoción
 * @param datos Datos a actualizar
 * @returns La promoción actualizada
 */
export async function actualizarPromocion(id, promotionData) {
  console.warn("Esta función no está completamente implementada. Se devolverán los datos sin cambios.")
  return { id, ...promotionData }
}

/**
 * Elimina una promoción (alias para compatibilidad)
 * @param id ID de la promoción
 * @returns true si se eliminó correctamente
 */
export const eliminarListaPrecio = eliminarPromocion

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns true si se eliminó correctamente
 */
export async function eliminarPromocion(id) {
  try {
    // Obtener la promoción actual para determinar su tipo
    const promocion = await obtenerPromocionPorId(id)
    const isCodeDiscount = !promocion.isAutomatic

    let mutation
    let variables

    if (isCodeDiscount) {
      // Eliminar un código de descuento
      mutation = gql`
        mutation DiscountCodeDelete($id: ID!) {
          discountCodeDelete(id: $id) {
            deletedDiscountId
            userErrors {
              field
              message
            }
          }
        }
      `
    } else {
      // Eliminar un descuento automático
      mutation = gql`
        mutation DiscountAutomaticDelete($id: ID!) {
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

    variables = {
      id: `gid://shopify/DiscountNode/${id}`,
    }

    const data = await shopifyClient.request(mutation, variables)

    // Verificar errores
    const userErrors = isCodeDiscount ? data.discountCodeDelete.userErrors : data.discountAutomaticDelete.userErrors

    if (userErrors && userErrors.length > 0) {
      throw new Error(`Error al eliminar promoción: ${userErrors[0].message}`)
    }

    // Invalidar caché
    promocionesCache = null
    ultimaActualizacion = null

    return { success: true, id: id }
  } catch (error) {
    console.error(`Error al eliminar promoción ${id}:`, error)
    throw new Error(`Error al eliminar la promoción: ${error.message}`)
  }
}

// Alias para compatibilidad
export const fetchPromotionById = obtenerPromocionPorId
export const fetchPriceListById = obtenerPromocionPorId
export const deletePromotionAlias = eliminarPromocion
export const createPriceList = crearPromocion
export const updatePriceList = async (id, data) => {
  console.warn("updatePriceList está obsoleto, usa updatePromotion en su lugar")
  return { id, ...data }
}
export const fetchPriceListByIdAlias = fetchPromotionById
//export const deletePromotion = deletePromotion

import {
  fetchPromotions,
  fetchPromotionById as fetchPromotionByIdAliasImport,
  createPromotion as createPromotionImport,
  deletePromotion as deletePromotionImport,
} from "./promotions"

// Exportar funciones con nombres en español
export const obtenerPromociones = fetchPromotions
export const obtenerPromocionPorId = fetchPromotionByIdAliasImport
export const crearPromocion = createPromotionImport
export const eliminarPromocion = deletePromotionImport

// Alias para compatibilidad
export const obtenerListasPrecios = fetchPromotions
export const eliminarListaPrecio = deletePromotionImport
export const createPriceListAlias = createPromotionImport
