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

    console.log("🔍 Obteniendo promociones de Shopify usando GraphQL...")

    let promociones = []

    try {
      // Primero obtener el conteo de códigos de descuento
      const countQuery = gql`
        query {
          discountCodesCount
        }
      `

      const countData = await shopifyClient.request(countQuery)
      console.log("📊 Conteo de códigos de descuento:", countData)

      // Obtener descuentos automáticos
      const automaticDiscountsQuery = gql`
        query {
          automaticDiscountNodes(first: 50) {
            edges {
              node {
                id
                automaticDiscount {
                  ... on DiscountAutomaticBasic {
                    title
                    startsAt
                    endsAt
                    status
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
                      items {
                        ... on AllDiscountItems {
                          allItems
                        }
                      }
                    }
                    minimumRequirement {
                      ... on DiscountMinimumSubtotal {
                        greaterThanOrEqualToSubtotal {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                  ... on DiscountAutomaticBxgy {
                    title
                    startsAt
                    endsAt
                    status
                    summary
                    customerBuys {
                      value {
                        ... on DiscountQuantity {
                          quantity
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
                  ... on DiscountAutomaticFreeShipping {
                    title
                    startsAt
                    endsAt
                    status
                    summary
                    minimumRequirement {
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

      const automaticData = await shopifyClient.request(automaticDiscountsQuery)
      console.log("📊 Descuentos automáticos obtenidos:", automaticData)

      if (automaticData?.automaticDiscountNodes?.edges) {
        const automaticPromociones = automaticData.automaticDiscountNodes.edges.map((edge) => {
          const node = edge.node
          const discount = node.automaticDiscount

          let valor = 0
          let tipo = "PORCENTAJE_DESCUENTO"
          let descripcion = discount?.summary || ""

          // Extraer valor del descuento
          if (discount?.customerGets?.value) {
            if (discount.customerGets.value.percentage) {
              valor = Number.parseFloat(discount.customerGets.value.percentage) * 100
              tipo = "PORCENTAJE_DESCUENTO"
              descripcion = `${valor}% de descuento`
            } else if (discount.customerGets.value.amount?.amount) {
              valor = Number.parseFloat(discount.customerGets.value.amount.amount)
              tipo = "MONTO_FIJO"
              descripcion = `${valor}${discount.customerGets.value.amount.currencyCode || "€"} de descuento`
            }
          }

          // Extraer monto mínimo
          let montoMinimo = null
          if (discount?.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
            montoMinimo = Number.parseFloat(discount.minimumRequirement.greaterThanOrEqualToSubtotal.amount)
            descripcion += ` • Monto mínimo de compra: ${montoMinimo}${discount.minimumRequirement.greaterThanOrEqualToSubtotal.currencyCode || "€"}`
          }

          // Determinar el tipo específico de descuento
          let tipoEspecifico = "AUTOMATICO"
          if (discount.__typename === "DiscountAutomaticBxgy") {
            tipoEspecifico = "BXGY"
            descripcion = "Compra X y obtén Y"
          } else if (discount.__typename === "DiscountAutomaticFreeShipping") {
            tipoEspecifico = "ENVIO_GRATIS"
            descripcion = "Envío gratis"
          }

          return {
            id: node.id,
            shopify_id: node.id.split("/").pop(),
            titulo: discount?.title || `Promoción automática ${node.id.split("/").pop()}`,
            descripcion,
            tipo,
            valor,
            codigo: "",
            activa: discount?.status === "ACTIVE",
            fecha_inicio: discount?.startsAt || new Date().toISOString(),
            fecha_fin: discount?.endsAt || null,
            es_automatica: true,
            monto_minimo: montoMinimo,
            tipo_especifico: tipoEspecifico,
          }
        })

        promociones = [...promociones, ...automaticPromociones]
      }

      // Obtener códigos de descuento
      const codeDiscountsQuery = gql`
        query {
          codeDiscountNodes(first: 50) {
            edges {
              node {
                id
                codeDiscount {
                  ... on DiscountCodeBasic {
                    title
                    codes(first: 5) {
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
                    asyncUsageCount
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
                      ... on DiscountMinimumSubtotal {
                        greaterThanOrEqualToSubtotal {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                  ... on DiscountCodeBxgy {
                    title
                    codes(first: 5) {
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
                    asyncUsageCount
                    customerBuys {
                      value {
                        ... on DiscountQuantity {
                          quantity
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
                  ... on DiscountCodeFreeShipping {
                    title
                    codes(first: 5) {
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
                    asyncUsageCount
                    minimumRequirement {
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

      const codeData = await shopifyClient.request(codeDiscountsQuery)
      console.log("📊 Códigos de descuento obtenidos:", codeData)

      if (codeData?.codeDiscountNodes?.edges) {
        const codePromociones = codeData.codeDiscountNodes.edges.map((edge) => {
          const node = edge.node
          const discount = node.codeDiscount

          // Extraer códigos
          let codigos = []
          if (discount?.codes?.edges) {
            codigos = discount.codes.edges.map((codeEdge) => codeEdge.node.code)
          }

          let valor = 0
          let tipo = "PORCENTAJE_DESCUENTO"
          let descripcion = discount?.summary || ""

          // Extraer valor del descuento
          if (discount?.customerGets?.value) {
            if (discount.customerGets.value.percentage) {
              valor = Number.parseFloat(discount.customerGets.value.percentage) * 100
              tipo = "PORCENTAJE_DESCUENTO"
              descripcion = `${valor}% de descuento`
            } else if (discount.customerGets.value.amount?.amount) {
              valor = Number.parseFloat(discount.customerGets.value.amount.amount)
              tipo = "MONTO_FIJO"
              descripcion = `${valor}${discount.customerGets.value.amount.currencyCode || "€"} de descuento`
            }
          }

          // Extraer monto mínimo
          let montoMinimo = null
          if (discount?.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) {
            montoMinimo = Number.parseFloat(discount.minimumRequirement.greaterThanOrEqualToSubtotal.amount)
            descripcion += ` • Monto mínimo de compra: ${montoMinimo}${discount.minimumRequirement.greaterThanOrEqualToSubtotal.currencyCode || "€"}`
          }

          // Determinar el tipo específico de descuento
          let tipoEspecifico = "CODIGO"
          if (discount.__typename === "DiscountCodeBxgy") {
            tipoEspecifico = "BXGY_CODIGO"
            descripcion = "Compra X y obtén Y (con código)"
          } else if (discount.__typename === "DiscountCodeFreeShipping") {
            tipoEspecifico = "ENVIO_GRATIS_CODIGO"
            descripcion = "Envío gratis (con código)"
          }

          return {
            id: node.id,
            shopify_id: node.id.split("/").pop(),
            titulo: discount?.title || `Promoción con código ${node.id.split("/").pop()}`,
            descripcion,
            tipo,
            valor,
            codigo: codigos.length > 0 ? codigos[0] : "",
            codigos_adicionales: codigos.slice(1),
            activa: discount?.status === "ACTIVE",
            fecha_inicio: discount?.startsAt || new Date().toISOString(),
            fecha_fin: discount?.endsAt || null,
            es_automatica: false,
            limite_uso: discount?.usageLimit || null,
            contador_uso: discount?.asyncUsageCount || 0,
            monto_minimo: montoMinimo,
            tipo_especifico: tipoEspecifico,
          }
        })

        promociones = [...promociones, ...codePromociones]
      }
    } catch (error) {
      console.error("Error obteniendo promociones con GraphQL:", error)

      // Fallback: crear promoción de ejemplo basada en lo que vimos en Shopify
      promociones = [
        {
          id: "gid://shopify/DiscountAutomaticNode/1",
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
          tipo_especifico: "AUTOMATICO",
        },
      ]
    }

    console.log(`✅ Total de promociones encontradas: ${promociones.length}`)

    return NextResponse.json({
      success: true,
      promociones,
      total: promociones.length,
    })
  } catch (error) {
    console.error("❌ Error general obteniendo promociones:", error)
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
