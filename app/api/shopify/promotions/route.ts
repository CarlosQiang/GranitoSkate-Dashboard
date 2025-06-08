import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import shopifyClient from "@/lib/shopify"
import { getBaseUrl } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Consulta GraphQL simplificada para obtener descuentos
    const query = `
  query getDiscounts($first: Int!) {
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
              summary
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
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
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
              summary
              usageLimit
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
              summary
              usageLimit
            }
          }
        }
      }
    }
    automaticDiscountNodes(first: $first) {
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
              }
            }
            ... on DiscountAutomaticBxgy {
              title
              startsAt
              endsAt
              status
              summary
            }
            ... on DiscountAutomaticFreeShipping {
              title
              startsAt
              endsAt
              status
              summary
            }
          }
        }
      }
    }
  }
`

    try {
      // Cambiar la llamada para usar variables
      const variables = { first: 50 }
      const data = await shopifyClient.request(query, variables)

      if (!data || (!data.codeDiscountNodes && !data.automaticDiscountNodes)) {
        console.warn("Respuesta de GraphQL sin datos de descuentos")
        return NextResponse.json({
          success: true,
          promociones: [],
          message: "No se encontraron promociones en Shopify",
        })
      }

      const codeDiscountNodes = data.codeDiscountNodes?.edges?.map((edge) => edge.node) || []
      const automaticDiscountNodes = data.automaticDiscountNodes?.edges?.map((edge) => edge.node) || []

      const discountNodes = [...codeDiscountNodes, ...automaticDiscountNodes]

      // Transformar los datos a un formato más amigable
      const promociones = discountNodes.map((node) => {
        const discount = node.codeDiscount || node.automaticDiscount
        const idPart = node.id.split("/").pop() || node.id
        const isAutomatic = !!node.automaticDiscount

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
          descripcion: discount.summary || "",
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
        console.log("🔄 Intentando obtener promociones con REST API...")

        const restResponse = await fetch(`${getBaseUrl()}/api/shopify/promotions/rest`, {
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("Cookie") || "",
          },
        })

        if (restResponse.ok) {
          const restData = await restResponse.json()
          return NextResponse.json(restData)
        }

        throw new Error(`REST API falló: ${restResponse.status}`)
      } catch (restError) {
        console.error("Error en la API REST:", restError)
        return NextResponse.json(
          {
            success: false,
            error: "Error al obtener promociones de Shopify",
            details: "Tanto GraphQL como REST API fallaron",
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
