import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    console.log("🔍 Obteniendo promociones de Shopify...")

    // Verificar variables de entorno
    if (!process.env.SHOPIFY_API_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error("Variables de entorno de Shopify no configuradas")
    }

    // Query GraphQL para obtener descuentos automáticos y códigos de descuento
    const query = `
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticApp {
                  title
                  status
                  startsAt
                  endsAt
                  asyncUsageCount
                  discountClass
                  summary
                }
                ... on DiscountAutomaticBasic {
                  title
                  status
                  startsAt
                  endsAt
                  asyncUsageCount
                  discountClass
                  summary
                  minimumRequirement {
                    ... on DiscountMinimumQuantity {
                      greaterThanOrEqualToQuantity
                    }
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
                  }
                }
                ... on DiscountCodeBasic {
                  title
                  status
                  startsAt
                  endsAt
                  asyncUsageCount
                  discountClass
                  summary
                  usageLimit
                  codes(first: 10) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  minimumRequirement {
                    ... on DiscountMinimumQuantity {
                      greaterThanOrEqualToQuantity
                    }
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
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      console.error("❌ Errores en la consulta GraphQL:", response.errors)
      throw new Error(`Error en GraphQL: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (!response.data?.discountNodes) {
      console.warn("⚠️ No se encontraron nodos de descuento")
      return NextResponse.json({ promotions: [] })
    }

    // Procesar las promociones
    const promotions = response.data.discountNodes.edges.map((edge: any) => {
      const node = edge.node
      const discount = node.discount

      // Extraer el valor del descuento
      let value = "0"
      if (discount.customerGets?.value?.percentage) {
        value = discount.customerGets.value.percentage.toString()
      } else if (discount.customerGets?.value?.amount?.amount) {
        value = discount.customerGets.value.amount.amount
      }

      // Extraer códigos si existen
      const codes =
        discount.codes?.edges?.map((codeEdge: any) => ({
          code: codeEdge.node.code,
        })) || []

      return {
        id: node.id,
        title: discount.title || "Promoción sin título",
        status: discount.status || "ACTIVE",
        startsAt: discount.startsAt,
        endsAt: discount.endsAt,
        asyncUsageCount: discount.asyncUsageCount || 0,
        discountClass: discount.discountClass || "PERCENTAGE",
        summary: discount.summary || discount.title || "Sin descripción",
        usageLimit: discount.usageLimit,
        value: value,
        codes: codes,
      }
    })

    console.log(`✅ ${promotions.length} promociones obtenidas de Shopify`)

    return NextResponse.json({
      promotions,
      total: promotions.length,
    })
  } catch (error) {
    console.error("❌ Error obteniendo promociones de Shopify:", error)
    return NextResponse.json(
      {
        error: "Error al obtener promociones de Shopify",
        details: error.message,
        promotions: [],
      },
      { status: 500 },
    )
  }
}
