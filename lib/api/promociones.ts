import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

// Función para obtener todas las promociones
export async function obtenerPromociones() {
  try {
    // Consulta más completa para obtener detalles de las promociones
    const query = gql`
      query {
        discountNodes(first: 50) {
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
                  combinesWith {
                    orderDiscounts
                    productDiscounts
                    shippingDiscounts
                  }
                  customerGets {
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
                }
                ... on DiscountCodeApp {
                  title
                  codes(first: 1) {
                    edges {
                      node {
                        code
                        usageCount
                      }
                    }
                  }
                  startsAt
                  endsAt
                  status
                  usageLimit
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

    const data = await shopifyClient.request(query)
    const discountNodes = data.discountNodes.edges.map((edge) => edge.node)

    // Transformar los datos a un formato más amigable
    const promociones = discountNodes.map((node) => {
      const discount = node.discount
      const idPart = node.id.split("/").pop() || node.id
      const isAutomatic = !discount.codes

      // Determinar el tipo de descuento
      let tipo = "PORCENTAJE_DESCUENTO"
      let valor = 0

      if (discount.customerGets && discount.customerGets.value) {
        if (discount.customerGets.value.percentage) {
          tipo = "PORCENTAJE_DESCUENTO"
          valor = Number.parseFloat(discount.customerGets.value.percentage)
        } else if (discount.customerGets.value.amount) {
          tipo = "CANTIDAD_FIJA_DESCUENTO"
          valor = Number.parseFloat(discount.customerGets.value.amount.amount)
        }
      }

      // Obtener código si existe
      let codigo = null
      if (!isAutomatic && discount.codes && discount.codes.edges.length > 0) {
        codigo = discount.codes.edges[0].node.code
      }

      // Determinar estado
      const activa = discount.status === "ACTIVE"

      return {
        id: node.id,
        shopify_id: idPart,
        titulo: discount.title || `Promoción ${idPart}`,
        descripcion: "",
        tipo,
        valor,
        codigo,
        objetivo: null,
        objetivo_id: null,
        condiciones: null,
        fecha_inicio: discount.startsAt,
        fecha_fin: discount.endsAt || null,
        activa,
        limite_uso: discount.usageLimit || null,
        contador_uso: !isAutomatic && discount.codes ? discount.codes.edges[0].node.usageCount : 0,
        es_automatica: isAutomatic,
      }
    })

    return promociones
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    throw new Error(`Error al obtener promociones: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Función para obtener una promoción por ID
export async function obtenerPromocionPorId(id: string) {
  // Implementación de obtenerPromocionPorId aquí
}

// Función para actualizar una promoción
export async function actualizarPromocion(id: string, promocion: any) {
  // Implementación de actualizarPromocion aquí
}

// Función para eliminar una promoción
export async function eliminarPromocion(id: string) {
  // Implementación de eliminarPromocion aquí
}

// Mantener los alias existentes
export const fetchPromociones = obtenerPromociones
export const fetchPriceListById = obtenerPromocionPorId
export const updatePriceList = actualizarPromocion
export const deletePriceList = eliminarPromocion
