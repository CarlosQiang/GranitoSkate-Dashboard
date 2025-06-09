import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Obteniendo promociones de Shopify...")

    const query = `
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticBasic {
                  title
                  status
                  startsAt
                  endsAt
                  summary
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
                }
                ... on DiscountCodeBasic {
                  title
                  status
                  startsAt
                  endsAt
                  summary
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
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
    }

    const promociones = data.data.discountNodes.edges.map((edge: any) => {
      const node = edge.node
      const discount = node.discount

      return {
        id: node.id,
        shopify_id: node.id,
        titulo: discount.title,
        descripcion: discount.summary || "",
        tipo: discount.customerGets?.value?.percentage ? "PORCENTAJE_DESCUENTO" : "CANTIDAD_FIJA_DESCUENTO",
        valor:
          discount.customerGets?.value?.percentage ||
          Number.parseFloat(discount.customerGets?.value?.amount?.amount || "0"),
        codigo: discount.codes?.nodes?.[0]?.code || null,
        fechaInicio: discount.startsAt,
        fechaFin: discount.endsAt,
        activa: discount.status === "ACTIVE",
        estado: discount.status,
        compraMinima: discount.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount || null,
      }
    })

    console.log(`✅ Promociones obtenidas de Shopify: ${promociones.length}`)

    return NextResponse.json({
      success: true,
      promociones: promociones,
    })
  } catch (error) {
    console.error("❌ Error obteniendo promociones de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones de Shopify",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
