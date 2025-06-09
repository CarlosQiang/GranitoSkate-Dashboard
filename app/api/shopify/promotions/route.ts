import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Obteniendo promociones de Shopify...")

    // Verificar que tenemos las variables de entorno necesarias
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error("Faltan variables de entorno para Shopify")
    }

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
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
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

    if (!data.data || !data.data.discountNodes || !data.data.discountNodes.edges) {
      throw new Error("Respuesta de Shopify inválida o vacía")
    }

    const promociones = data.data.discountNodes.edges.map((edge) => {
      const node = edge.node
      const discount = node.discount

      // Determinar si es un descuento con código o automático
      const isCodeDiscount = !!discount.codes

      // Extraer el valor del descuento
      let valor = 0
      let tipo = "PERCENTAGE_DISCOUNT"

      if (discount.customerGets?.value?.percentage) {
        valor = Math.round(discount.customerGets.value.percentage * 100) // Convertir de decimal a porcentaje
        tipo = "PERCENTAGE_DISCOUNT"
      } else if (discount.customerGets?.value?.amount?.amount) {
        valor = Number.parseFloat(discount.customerGets.value.amount.amount)
        tipo = "FIXED_AMOUNT_DISCOUNT"
      }

      // Extraer el requisito mínimo si existe
      let compraMinima = null
      if (discount.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
        compraMinima = Number.parseFloat(discount.minimumRequirement.greaterThanOrEqualToSubtotal.amount)
      }

      return {
        id: node.id,
        shopify_id: node.id,
        titulo: discount.title,
        descripcion: discount.summary || "",
        tipo: tipo,
        valor: valor,
        codigo: isCodeDiscount ? discount.codes?.nodes?.[0]?.code || null : null,
        fechaInicio: discount.startsAt,
        fechaFin: discount.endsAt,
        activa: discount.status === "ACTIVE",
        estado: discount.status,
        compraMinima: compraMinima,
        esShopify: true, // Marcar que viene de Shopify
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
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
