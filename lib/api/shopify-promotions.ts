import { gql } from "graphql-request"
import shopifyClient from "@/lib/shopify"

// Función para actualizar un descuento automático en Shopify
export async function updateShopifyAutomaticDiscount(id: string, data: any) {
  try {
    console.log(`🔄 Actualizando descuento automático en Shopify: ${id}`)

    const mutation = gql`
      mutation discountAutomaticBasicUpdate($automaticBasicDiscount: DiscountAutomaticBasicInput!, $id: ID!) {
        discountAutomaticBasicUpdate(automaticBasicDiscount: $automaticBasicDiscount, id: $id) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                title
                status
                startsAt
                endsAt
                minimumRequirement {
                  ... on DiscountMinimumSubtotal {
                    greaterThanOrEqualToSubtotal {
                      amount
                      currencyCode
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
                    ... on AllDiscountItems {
                      allItems
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

    // Preparar los datos para Shopify
    const automaticBasicDiscount = {
      title: data.titulo,
      startsAt: data.fechaInicio,
      endsAt: data.fechaFin,
      customerGets: {
        value:
          data.tipo === "PERCENTAGE_DISCOUNT"
            ? { percentage: Number.parseFloat(data.valor) / 100 }
            : {
                discountAmount: {
                  amount: data.valor,
                  appliesOnEachItem: false,
                },
              },
        items: {
          all: true,
        },
      },
      minimumRequirement: data.compraMinima
        ? {
            greaterThanOrEqualToSubtotal: {
              amount: data.compraMinima,
              currencyCode: "EUR",
            },
          }
        : null,
    }

    const result = await shopifyClient.request(mutation, {
      id,
      automaticBasicDiscount,
    })

    if (result.discountAutomaticBasicUpdate.userErrors.length > 0) {
      throw new Error(
        `Errores de Shopify: ${result.discountAutomaticBasicUpdate.userErrors.map((e) => e.message).join(", ")}`,
      )
    }

    console.log(`✅ Descuento automático actualizado en Shopify`)
    return result.discountAutomaticBasicUpdate.automaticDiscountNode
  } catch (error) {
    console.error(`❌ Error actualizando descuento automático en Shopify:`, error)
    throw error
  }
}

// Función para actualizar un descuento con código en Shopify
export async function updateShopifyCodeDiscount(id: string, data: any) {
  try {
    console.log(`🔄 Actualizando descuento con código en Shopify: ${id}`)

    const mutation = gql`
      mutation discountCodeBasicUpdate($basicCodeDiscount: DiscountCodeBasicInput!, $id: ID!) {
        discountCodeBasicUpdate(basicCodeDiscount: $basicCodeDiscount, id: $id) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                status
                startsAt
                endsAt
                codes(first: 1) {
                  nodes {
                    code
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
          userErrors {
            field
            message
          }
        }
      }
    `

    const basicCodeDiscount = {
      title: data.titulo,
      code: data.codigo,
      startsAt: data.fechaInicio,
      endsAt: data.fechaFin,
      customerGets: {
        value:
          data.tipo === "PERCENTAGE_DISCOUNT"
            ? { percentage: Number.parseFloat(data.valor) / 100 }
            : {
                discountAmount: {
                  amount: data.valor,
                  appliesOnEachItem: false,
                },
              },
        items: {
          all: true,
        },
      },
      usageLimit: data.limitarUsos ? Number.parseInt(data.limiteUsos) : null,
    }

    const result = await shopifyClient.request(mutation, {
      id,
      basicCodeDiscount,
    })

    if (result.discountCodeBasicUpdate.userErrors.length > 0) {
      throw new Error(
        `Errores de Shopify: ${result.discountCodeBasicUpdate.userErrors.map((e) => e.message).join(", ")}`,
      )
    }

    console.log(`✅ Descuento con código actualizado en Shopify`)
    return result.discountCodeBasicUpdate.codeDiscountNode
  } catch (error) {
    console.error(`❌ Error actualizando descuento con código en Shopify:`, error)
    throw error
  }
}

// Función para crear un nuevo descuento automático en Shopify
export async function createShopifyAutomaticDiscount(data: any) {
  try {
    console.log(`🆕 Creando descuento automático en Shopify`)

    const mutation = gql`
      mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
        discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                title
                status
                startsAt
                endsAt
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
          userErrors {
            field
            message
          }
        }
      }
    `

    const automaticBasicDiscount = {
      title: data.titulo,
      startsAt: data.fechaInicio,
      endsAt: data.fechaFin,
      customerGets: {
        value:
          data.tipo === "PERCENTAGE_DISCOUNT"
            ? { percentage: Number.parseFloat(data.valor) / 100 }
            : {
                discountAmount: {
                  amount: data.valor,
                  appliesOnEachItem: false,
                },
              },
        items: {
          all: true,
        },
      },
    }

    const result = await shopifyClient.request(mutation, {
      automaticBasicDiscount,
    })

    if (result.discountAutomaticBasicCreate.userErrors.length > 0) {
      throw new Error(
        `Errores de Shopify: ${result.discountAutomaticBasicCreate.userErrors.map((e) => e.message).join(", ")}`,
      )
    }

    console.log(`✅ Descuento automático creado en Shopify`)
    return result.discountAutomaticBasicCreate.automaticDiscountNode
  } catch (error) {
    console.error(`❌ Error creando descuento automático en Shopify:`, error)
    throw error
  }
}

// Función para crear un descuento con código en Shopify
export async function createShopifyCodeDiscount(data: any) {
  try {
    console.log(`🆕 Creando descuento con código en Shopify`)

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
                  nodes {
                    code
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
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const basicCodeDiscount = {
      title: data.titulo,
      code: data.codigo,
      startsAt: data.fechaInicio,
      endsAt: data.fechaFin,
      customerGets: {
        value:
          data.tipo === "PERCENTAGE_DISCOUNT"
            ? { percentage: Number.parseFloat(data.valor) / 100 }
            : {
                discountAmount: {
                  amount: data.valor,
                  appliesOnEachItem: false,
                },
              },
        items: {
          all: true,
        },
      },
      usageLimit: data.limitarUsos ? Number.parseInt(data.limiteUsos) : null,
    }

    const result = await shopifyClient.request(mutation, {
      basicCodeDiscount,
    })

    if (result.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(
        `Errores de Shopify: ${result.discountCodeBasicCreate.userErrors.map((e) => e.message).join(", ")}`,
      )
    }

    console.log(`✅ Descuento con código creado en Shopify`)
    return result.discountCodeBasicCreate.codeDiscountNode
  } catch (error) {
    console.error(`❌ Error creando descuento con código en Shopify:`, error)
    throw error
  }
}
