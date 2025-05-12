import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { Promotion } from "@/types/promotions"

// Función para obtener todas las promociones
export async function obtenerPromociones() {
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
                    status
                    startsAt
                    endsAt
                  }
                }
                ... on DiscountCodeNode {
                  codeDiscount {
                    title
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
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)
    return data.discountNodes.edges.map((edge) => {
      const node = edge.node
      const discount = node.discount

      let title = ""
      let status = "UNKNOWN"
      let startsAt = ""
      let endsAt = ""
      let code = ""

      if (discount.__typename === "DiscountAutomaticNode") {
        title = discount.automaticDiscount.title
        status = discount.automaticDiscount.status
        startsAt = discount.automaticDiscount.startsAt
        endsAt = discount.automaticDiscount.endsAt
      } else if (discount.__typename === "DiscountCodeNode") {
        title = discount.codeDiscount.title
        status = discount.codeDiscount.status
        startsAt = discount.codeDiscount.startsAt
        endsAt = discount.codeDiscount.endsAt
        code = discount.codeDiscount.codes?.edges?.[0]?.node?.code || ""
      }

      return {
        id: node.id,
        title: title,
        status: status,
        startsAt: startsAt,
        endsAt: endsAt,
        code: code,
      }
    })
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    throw new Error(`Error al obtener promociones: ${error.message}`)
  }
}

// Función para obtener una promoción por ID
export async function fetchPriceListById(id: string): Promise<Promotion> {
  try {
    const query = gql`
      query GetDiscountNode($id: ID!) {
        discountNode(id: $id) {
          id
          discount {
            ... on DiscountAutomaticNode {
              automaticDiscount {
                title
                startsAt
                endsAt
                status
              }
            }
            ... on DiscountCodeNode {
              codeDiscount {
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
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data.discountNode) {
      throw new Error(`No se encontró la promoción con ID: ${id}`)
    }

    const discountNode = data.discountNode
    let title = ""
    let startsAt = ""
    let endsAt: string | null = null
    let status = "UNKNOWN"
    let code = null

    if (discountNode.discount.__typename === "DiscountAutomaticNode") {
      title = discountNode.discount.automaticDiscount.title
      startsAt = discountNode.discount.automaticDiscount.startsAt
      endsAt = discountNode.discount.automaticDiscount.endsAt
      status = discountNode.discount.automaticDiscount.status
    } else if (discountNode.discount.__typename === "DiscountCodeNode") {
      title = discountNode.discount.codeDiscount.title
      startsAt = discountNode.discount.codeDiscount.startsAt
      endsAt = discountNode.discount.codeDiscount.endsAt
      status = discountNode.discount.codeDiscount.status
      code = discountNode.discount.codeDiscount.codes?.edges?.[0]?.node?.code || null
    }

    return {
      id: discountNode.id,
      title: title,
      code: code,
      isAutomatic: discountNode.discount.__typename === "DiscountAutomaticNode",
      startsAt: startsAt,
      endsAt: endsAt,
      status: status,
      valueType: "percentage", // TODO: Determinar el tipo correcto
      value: 10, // TODO: Determinar el valor correcto
      target: "CART", // TODO: Determinar el objetivo correcto
    } as Promotion
  } catch (error) {
    console.error(`Error al obtener la lista de precios con ID ${id}:`, error)
    throw new Error(`Error al cargar la lista de precios: ${error.message}`)
  }
}

export async function deletePriceList(id: string): Promise<string> {
  try {
    const mutation = gql`
      mutation DiscountDelete($id: ID!) {
        discountNodeDelete(id: $id) {
          deletedNodeId
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

    if (data.discountNodeDelete.userErrors.length > 0) {
      throw new Error(data.discountNodeDelete.userErrors[0].message)
    }

    return data.discountNodeDelete.deletedNodeId
  } catch (error) {
    console.error(`Error deleting price list with ID ${id}:`, error)
    throw new Error(`Error al eliminar la lista de precios: ${error.message}`)
  }
}

export async function crearPromocion(datos: any): Promise<any> {
  try {
    const mutation = gql`
      mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
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

    const variables = {
      basicCodeDiscount: {
        title: datos.titulo,
        startsAt: datos.fechaInicio,
        endsAt: datos.fechaFin,
        codes: [{ code: datos.codigo }],
        customerGets: {
          value: {
            percentage: datos.valor,
          },
          items: {
            all: true,
          },
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(data.discountCodeBasicCreate.userErrors[0].message)
    }

    return data.discountCodeBasicCreate.codeDiscountNode
  } catch (error) {
    console.error("Error al crear la promoción:", error)
    throw new Error(`Error al crear la promoción: ${error.message}`)
  }
}

export default { fetchPromotions, fetchPriceListById, deletePriceList, crearPromocion }
