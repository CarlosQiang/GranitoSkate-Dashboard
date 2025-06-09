import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    console.log("🔍 Obteniendo promociones de Shopify...")

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Variables de entorno de Shopify no configuradas")
      return NextResponse.json({
        success: false,
        error: "Variables de entorno de Shopify no configuradas",
        promociones: [],
      })
    }

    // Query GraphQL mejorado para obtener descuentos
    const query = `
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              discount {
                __typename
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
      console.error(`❌ Error en respuesta de Shopify: ${response.status}`)
      return NextResponse.json(
        {
          success: false,
          error: `Error en respuesta de Shopify: ${response.status}`,
          promociones: [],
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ Errores en la consulta GraphQL:", data.errors)
      return NextResponse.json(
        {
          success: false,
          error: `Errores en la consulta GraphQL: ${data.errors.map((e: any) => e.message).join(", ")}`,
          promociones: [],
        },
        { status: 500 },
      )
    }

    if (!data.data || !data.data.discountNodes || !data.data.discountNodes.edges) {
      console.warn("⚠️ No se encontraron nodos de descuento")
      return NextResponse.json({
        success: true,
        promociones: [],
      })
    }

    // Procesar las promociones con el formato correcto
    const promociones = data.data.discountNodes.edges.map((edge: any) => {
      const node = edge.node
      const discount = node.discount

      // Determinar si es un descuento con código o automático
      const isCodeDiscount = discount.__typename === "DiscountCodeBasic"

      // Extraer el valor del descuento
      let valor = 0
      let tipo = "PERCENTAGE_DISCOUNT"

      if (discount.customerGets?.value?.percentage) {
        valor = Math.round(discount.customerGets.value.percentage * 100) // Convertir a porcentaje
        tipo = "PERCENTAGE_DISCOUNT"
      } else if (discount.customerGets?.value?.amount?.amount) {
        valor = Number.parseFloat(discount.customerGets.value.amount.amount)
        tipo = "FIXED_AMOUNT_DISCOUNT"
      }

      // Extraer código si existe
      const codigo = isCodeDiscount ? discount.codes?.nodes?.[0]?.code || null : null

      // Determinar el estado
      let activa = false
      const now = new Date()
      const fechaInicio = discount.startsAt ? new Date(discount.startsAt) : null
      const fechaFin = discount.endsAt ? new Date(discount.endsAt) : null

      if (discount.status === "ACTIVE") {
        if (!fechaInicio || fechaInicio <= now) {
          if (!fechaFin || fechaFin >= now) {
            activa = true
          }
        }
      }

      return {
        id: node.id,
        shopify_id: node.id,
        titulo: discount.title || "Promoción sin título",
        descripcion: discount.summary || "",
        tipo: tipo,
        valor: valor,
        codigo: codigo,
        fechaInicio: discount.startsAt,
        fechaFin: discount.endsAt,
        activa: activa,
        estado: discount.status || "ACTIVE",
        esShopify: true,
        fechaCreacion: discount.startsAt || new Date().toISOString(),
      }
    })

    console.log(`✅ ${promociones.length} promociones procesadas de Shopify`)

    return NextResponse.json({
      success: true,
      promociones,
      total: promociones.length,
    })
  } catch (error) {
    console.error("❌ Error obteniendo promociones de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones de Shopify",
        details: (error as Error).message,
        promociones: [],
      },
      { status: 500 },
    )
  }
}
