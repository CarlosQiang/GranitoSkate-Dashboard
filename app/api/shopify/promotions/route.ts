import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Consulta GraphQL para obtener descuentos
    const query = gql`
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticApp {
                  title
                  startsAt
                  endsAt
                  status
                  discountClass
                  combinesWith {
                    orderDiscounts
                    productDiscounts
                    shippingDiscounts
                  }
                  customerGets {
                    items {
                      ... on DiscountProducts {
                        products(first: 5) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                    }
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
                ... on DiscountCodeApp {
                  title
                  codes(first: 1) {
                    edges {
                      node {
                        code
                        usageCount
                      }
                    }
                  }
                  startsAt
                  endsAt
                  status
                  usageLimit
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

    try {
      const data = await shopifyClient.request(query)

      if (!data || !data.discountNodes || !data.discountNodes.edges) {
        console.warn("Respuesta de GraphQL sin datos de descuentos")
        return NextResponse.json({
          success: true,
          promociones: [],
          message: "No se encontraron promociones en Shopify",
        })
      }

      const discountNodes = data.discountNodes.edges.map((edge) => edge.node)

      // Transformar los datos a un formato más amigable
      const promociones = discountNodes.map((node) => {
        const discount = node.discount
        const idPart = node.id.split("/").pop() || node.id
        const isAutomatic = !discount.codes

        // Determinar el tipo de descuento
        let tipo = "PORCENTAJE_DESCUENTO"
        let valor = 0

        if (discount.customerGets && discount.customerGets.value) {
          if (discount.customerGets.value.percentage) {
            tipo = "PORCENTAJE_DESCUENTO"
            valor = Number.parseFloat(discount.customerGets.value.percentage)
          } else if (discount.customerGets.value.amount) {
            tipo = "CANTIDAD_FIJA_DESCUENTO"
            valor = Number.parseFloat(discount.customerGets.value.amount.amount)
          }
        }

        // Obtener código si existe
        let codigo = null
        if (!isAutomatic && discount.codes && discount.codes.edges && discount.codes.edges.length > 0) {
          codigo = discount.codes.edges[0].node.code
        }

        // Determinar estado
        const activa = discount.status === "ACTIVE"

        return {
          id: node.id,
          shopify_id: idPart,
          titulo: discount.title || `Promoción ${idPart}`,
          descripcion: "",
          tipo,
          valor,
          codigo,
          objetivo: null,
          objetivo_id: null,
          condiciones: null,
          fecha_inicio: discount.startsAt,
          fecha_fin: discount.endsAt || null,
          activa,
          limite_uso: discount.usageLimit || null,
          contador_uso:
            !isAutomatic && discount.codes && discount.codes.edges ? discount.codes.edges[0].node.usageCount : 0,
          es_automatica: isAutomatic,
        }
      })

      return NextResponse.json({
        success: true,
        promociones,
        total: promociones.length,
      })
    } catch (graphqlError) {
      console.error("Error en la consulta GraphQL:", graphqlError)

      // Intentar con la API REST como fallback
      try {
        console.log("Intentando obtener promociones con REST API...")

        // Implementar llamada a REST API aquí si es necesario

        return NextResponse.json({
          success: true,
          promociones: [],
          message: "No se pudieron obtener promociones con GraphQL, y la API REST no está implementada",
        })
      } catch (restError) {
        console.error("Error en la API REST:", restError)
        return NextResponse.json(
          {
            success: false,
            error: "Error al obtener promociones de Shopify",
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones",
      },
      { status: 500 },
    )
  }
}
