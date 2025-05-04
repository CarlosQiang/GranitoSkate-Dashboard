import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchPromotions(limit = 20) {
  try {
    const query = gql`
      query GetDiscountCodes($first: Int!) {
        codeDiscountNodes(first: $first) {
          edges {
            node {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
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
                  }
                }
                ... on DiscountCodeBxgy {
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
                }
                ... on DiscountCodeFreeShipping {
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
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      first: limit,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.codeDiscountNodes?.edges) {
      throw new Error("No se pudieron obtener las promociones")
    }

    return data.codeDiscountNodes.edges.map((edge) => {
      const node = edge.node
      const codeDiscount = node.codeDiscount
      const code = codeDiscount.codes?.edges?.[0]?.node?.code || ""

      return {
        id: node.id,
        title: codeDiscount.title,
        code,
        startsAt: codeDiscount.startsAt,
        endsAt: codeDiscount.endsAt,
        status: codeDiscount.status,
        value: codeDiscount.customerGets?.value?.percentage
          ? `${codeDiscount.customerGets.value.percentage}%`
          : codeDiscount.customerGets?.value?.amount?.amount
            ? `${codeDiscount.customerGets.value.amount.amount} ${codeDiscount.customerGets.value.amount.currencyCode}`
            : "Promoción especial",
      }
    })
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw new Error(`Error al cargar promociones: ${(error as Error).message}`)
  }
}

export async function fetchPromotionById(id) {
  try {
    const query = gql`
      query GetDiscountCode($id: ID!) {
        codeDiscountNode(id: $id) {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
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
              }
            }
            ... on DiscountCodeBxgy {
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
            }
            ... on DiscountCodeFreeShipping {
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
            }
          }
        }
      }
    `

    const variables = {
      id,
    }

    const data = await shopifyClient.request(query, variables)

    if (!data?.codeDiscountNode) {
      throw new Error("No se pudo obtener la promoción")
    }

    const node = data.codeDiscountNode
    const codeDiscount = node.codeDiscount
    const code = codeDiscount.codes?.edges?.[0]?.node?.code || ""

    return {
      id: node.id,
      title: codeDiscount.title,
      code,
      startsAt: codeDiscount.startsAt,
      endsAt: codeDiscount.endsAt,
      status: codeDiscount.status,
      value: codeDiscount.customerGets?.value?.percentage
        ? `${codeDiscount.customerGets.value.percentage}%`
        : codeDiscount.customerGets?.value?.amount?.amount
          ? `${codeDiscount.customerGets.value.amount.amount} ${codeDiscount.customerGets.value.amount.currencyCode}`
          : "Promoción especial",
    }
  } catch (error) {
    console.error("Error fetching promotion by ID:", error)
    throw new Error(`Error al cargar la promoción: ${(error as Error).message}`)
  }
}

export async function createBasicPromotion(promotionData) {
  try {
    const mutation = gql`
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
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
        title: promotionData.title,
        code: promotionData.code,
        startsAt: promotionData.startsAt || new Date().toISOString(),
        endsAt: promotionData.endsAt,
        customerSelection: {
          all: true,
        },
        customerGets: {
          value: {
            percentage: Number.parseFloat(promotionData.percentage) || 0.1,
          },
          items: {
            all: true,
          },
        },
      },
    }

    const data = await shopifyClient.request(mutation, variables)

    if (data?.discountCodeBasicCreate?.userErrors?.length > 0) {
      throw new Error(data.discountCodeBasicCreate.userErrors[0].message)
    }

    return data.discountCodeBasicCreate.codeDiscountNode
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error al crear la promoción: ${(error as Error).message}`)
  }
}

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

    if (data?.discountCodeDelete?.userErrors?.length > 0) {
      throw new Error(data.discountCodeDelete.userErrors[0].message)
    }

    return { success: true, id: data.discountCodeDelete.deletedCodeDiscountId }
  } catch (error) {
    console.error("Error deleting promotion:", error)
    throw new Error(`Error al eliminar la promoción: ${(error as Error).message}`)
  }
}
