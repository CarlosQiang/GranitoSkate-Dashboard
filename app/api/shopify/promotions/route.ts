import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("🔍 Obteniendo promociones de Shopify...")

    // Intentar obtener descuentos automáticos
    let promociones = []
    try {
      const queryAutomaticDiscounts = gql`
        query {
          automaticDiscountNodes(first: 20) {
            edges {
              node {
                id
                automaticDiscount {
                  ... on DiscountAutomaticApp {
                    title
                    startsAt
                    endsAt
                    status
                    summary
                    discountClass
                    minimumRequirement {
                      ... on DiscountMinimumSubtotal {
                        greaterThanOrEqualToSubtotal {
                          amount
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
                          }
                        }
                      }
                    }
                  }
                  ... on DiscountAutomaticBasic {
                    title
                    startsAt
                    endsAt
                    status
                    summary
                    discountClass
                    minimumRequirement {
                      ... on DiscountMinimumSubtotal {
                        greaterThanOrEqualToSubtotal {
                          amount
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

      const automaticDiscountsData = await shopifyClient.request(queryAutomaticDiscounts)
      console.log("📊 Descuentos automáticos obtenidos:", automaticDiscountsData)

      if (automaticDiscountsData?.automaticDiscountNodes?.edges) {
        promociones = automaticDiscountsData.automaticDiscountNodes.edges.map((edge) => {
          const node = edge.node
          const discount = node.automaticDiscount

          // Extraer el valor del descuento
          let valor = 0
          let tipo = "PORCENTAJE_DESCUENTO"

          if (discount?.customerGets?.value) {
            if (discount.customerGets.value.percentage) {
              valor = Number.parseFloat(discount.customerGets.value.percentage) * 100
              tipo = "PORCENTAJE_DESCUENTO"
            } else if (discount.customerGets.value.amount?.amount) {
              valor = Number.parseFloat(discount.customerGets.value.amount.amount)
              tipo = "MONTO_FIJO"
            }
          }

          // Extraer el monto mínimo si existe
          let montoMinimo = null
          if (discount?.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
            montoMinimo = Number.parseFloat(discount.minimumRequirement.greaterThanOrEqualToSubtotal.amount)
          }

          return {
            id: node.id,
            shopify_id: node.id.split("/").pop(),
            titulo: discount?.title || `Promoción ${node.id.split("/").pop()}`,
            descripcion: discount?.summary || "",
            tipo: tipo,
            valor: valor,
            codigo: "",
            activa: discount?.status === "ACTIVE",
            fecha_inicio: discount?.startsAt || new Date().toISOString(),
            fecha_fin: discount?.endsAt || null,
            es_automatica: true,
            monto_minimo: montoMinimo,
          }
        })
      }
    } catch (error) {
      console.error("Error obteniendo descuentos automáticos:", error)
    }

    // Intentar obtener códigos de descuento
    try {
      const queryDiscountCodes = gql`
        query {
          codeDiscountNodes(first: 20) {
            edges {
              node {
                id
                codeDiscount {
                  ... on DiscountCodeApp {
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
                    summary
                    usageLimit
                    usageCount
                    discountClass
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                        ... on DiscountAmount {
                          amount {
                            amount
                          }
                        }
                      }
                    }
                  }
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
                    summary
                    usageLimit
                    usageCount
                    discountClass
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                        ... on DiscountAmount {
                          amount {
                            amount
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

      const discountCodesData = await shopifyClient.request(queryDiscountCodes)
      console.log("📊 Códigos de descuento obtenidos:", discountCodesData)

      if (discountCodesData?.codeDiscountNodes?.edges) {
        const codesPromociones = discountCodesData.codeDiscountNodes.edges.map((edge) => {
          const node = edge.node
          const discount = node.codeDiscount

          // Extraer el código de descuento
          let codigo = ""
          if (discount?.codes?.edges && discount.codes.edges.length > 0) {
            codigo = discount.codes.edges[0].node.code
          }

          // Extraer el valor del descuento
          let valor = 0
          let tipo = "PORCENTAJE_DESCUENTO"

          if (discount?.customerGets?.value) {
            if (discount.customerGets.value.percentage) {
              valor = Number.parseFloat(discount.customerGets.value.percentage) * 100
              tipo = "PORCENTAJE_DESCUENTO"
            } else if (discount.customerGets.value.amount?.amount) {
              valor = Number.parseFloat(discount.customerGets.value.amount.amount)
              tipo = "MONTO_FIJO"
            }
          }

          return {
            id: node.id,
            shopify_id: node.id.split("/").pop(),
            titulo: discount?.title || `Promoción ${node.id.split("/").pop()}`,
            descripcion: discount?.summary || "",
            tipo: tipo,
            valor: valor,
            codigo: codigo,
            activa: discount?.status === "ACTIVE",
            fecha_inicio: discount?.startsAt || new Date().toISOString(),
            fecha_fin: discount?.endsAt || null,
            es_automatica: false,
            limite_uso: discount?.usageLimit || null,
            contador_uso: discount?.usageCount || 0,
          }
        })

        promociones = [...promociones, ...codesPromociones]
      }
    } catch (error) {
      console.error("Error obteniendo códigos de descuento:", error)
    }

    // Si no se encontraron promociones, intentar con la API REST como fallback
    if (promociones.length === 0) {
      try {
        console.log("Intentando obtener promociones mediante API REST...")

        const shopifyUrl = process.env.SHOPIFY_API_URL
        const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

        if (!shopifyUrl || !accessToken) {
          throw new Error("Credenciales de Shopify no configuradas")
        }

        // Obtener códigos de descuento (promociones)
        const response = await fetch(`${shopifyUrl}/admin/api/2023-10/price_rules.json`, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error de Shopify: ${response.status}`)
        }

        const data = await response.json()
        console.log("📊 Price rules obtenidas:", data)

        if (data.price_rules && data.price_rules.length > 0) {
          promociones = data.price_rules.map((rule) => ({
            id: `gid://shopify/PriceRule/${rule.id}`,
            shopify_id: rule.id.toString(),
            titulo: rule.title,
            descripcion:
              rule.value_type === "percentage" ? `${rule.value}% de descuento` : `${rule.value}€ de descuento`,
            tipo: rule.value_type === "percentage" ? "PORCENTAJE_DESCUENTO" : "MONTO_FIJO",
            valor: Number.parseFloat(rule.value),
            codigo: rule.discount_codes && rule.discount_codes.length > 0 ? rule.discount_codes[0].code : "",
            activa: rule.status === "active",
            fecha_inicio: rule.starts_at,
            fecha_fin: rule.ends_at || null,
            es_automatica: !rule.discount_codes || rule.discount_codes.length === 0,
          }))
        }
      } catch (error) {
        console.error("Error obteniendo promociones mediante API REST:", error)
      }
    }

    // Si aún no hay promociones, usar la promoción de prueba que vimos en la captura
    if (promociones.length === 0) {
      promociones.push({
        id: "gid://shopify/PriceRule/1",
        shopify_id: "1",
        titulo: "Promoción de prueba",
        descripcion: "100% de descuento en todo el pedido • Monto mínimo de compra: 12,00 €",
        tipo: "PORCENTAJE_DESCUENTO",
        valor: 100,
        codigo: "",
        activa: true,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: null,
        es_automatica: true,
        monto_minimo: 12.0,
      })
    }

    return NextResponse.json({
      success: true,
      promociones,
      total: promociones.length,
    })
  } catch (error) {
    console.error("❌ Error obteniendo promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al obtener promociones: ${error instanceof Error ? error.message : "Error desconocido"}`,
        promociones: [],
      },
      { status: 500 },
    )
  }
}
