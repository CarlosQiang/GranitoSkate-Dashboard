import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("🔍 Obteniendo promociones de Shopify...")

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Variables de entorno de Shopify no configuradas")
      return NextResponse.json({
        success: false,
        error: "Variables de entorno de Shopify no configuradas",
        promotions: [],
      })
    }

    // Query GraphQL para obtener descuentos
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
                }
              }
            }
          }
        }
      }
    `

    const shopifyResponse = await fetch(
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

    if (!shopifyResponse.ok) {
      console.error(`❌ Error en respuesta de Shopify: ${shopifyResponse.status}`)
      return NextResponse.json(
        {
          success: false,
          error: `Error en respuesta de Shopify: ${shopifyResponse.status}`,
          promotions: [],
        },
        { status: 500 },
      )
    }

    const shopifyData = await shopifyResponse.json()

    if (shopifyData.errors) {
      console.error("❌ Errores en la consulta GraphQL:", shopifyData.errors)
      return NextResponse.json(
        {
          success: false,
          error: `Errores en la consulta GraphQL: ${shopifyData.errors.map((e) => e.message).join(", ")}`,
          promotions: [],
        },
        { status: 500 },
      )
    }

    if (!shopifyData.data || !shopifyData.data.discountNodes || !shopifyData.data.discountNodes.edges) {
      console.warn("⚠️ No se encontraron nodos de descuento")
      return NextResponse.json({
        success: true,
        promotions: [],
      })
    }

    // Procesar las promociones de Shopify
    const shopifyPromotions = shopifyData.data.discountNodes.edges.map((edge) => {
      const node = edge.node
      const discount = node.discount

      // Determinar si es un descuento con código o automático
      const isCodeDiscount = !!discount.codes

      // Extraer el valor del descuento
      let value = "0"
      let discountClass = "PERCENTAGE"

      if (discount.customerGets?.value?.percentage) {
        value = discount.customerGets.value.percentage.toString()
        discountClass = "PERCENTAGE"
      } else if (discount.customerGets?.value?.amount?.amount) {
        value = discount.customerGets.value.amount.amount
        discountClass = "AMOUNT"
      }

      // Extraer códigos si existen
      const codes = isCodeDiscount
        ? discount.codes?.nodes?.map((node) => ({
            code: node.code,
          }))
        : []

      return {
        id: node.id,
        title: discount.title || "Promoción sin título",
        status: discount.status || "ACTIVE",
        startsAt: discount.startsAt,
        endsAt: discount.endsAt,
        summary: discount.summary || "",
        discountClass: discountClass,
        value: value,
        codes: codes || [],
      }
    })

    console.log(`✅ ${shopifyPromotions.length} promociones obtenidas de Shopify`)

    // Obtener promociones de la base de datos local
    const localResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/db/promociones`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!localResponse.ok) {
      throw new Error(`Error obteniendo promociones: ${localResponse.status}`)
    }

    const localPromotions = await localResponse.json()

    // Combinar promociones de Shopify y locales
    const promotions = [...shopifyPromotions, ...localPromotions]

    return NextResponse.json({
      success: true,
      promotions,
      total: promotions.length,
    })
  } catch (error) {
    console.error("Error obteniendo promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones",
        details: error.message,
        promotions: [],
      },
      { status: 500 },
    )
  }
}
