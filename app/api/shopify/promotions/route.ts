import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const SHOPIFY_GRAPHQL_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`

const DISCOUNTS_QUERY = `
  query getDiscounts($first: Int!) {
    discountNodes(first: $first) {
      edges {
        node {
          id
          discount {
            ... on DiscountCodeApp {
              title
              status
              startsAt
              endsAt
              usageLimit
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              discountClass
            }
            ... on DiscountCodeBasic {
              title
              status
              startsAt
              endsAt
              usageLimit
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              summary
            }
            ... on DiscountCodeBxgy {
              title
              status
              startsAt
              endsAt
              usageLimit
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              summary
            }
            ... on DiscountCodeFreeShipping {
              title
              status
              startsAt
              endsAt
              usageLimit
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              summary
            }
            ... on DiscountAutomaticApp {
              title
              status
              startsAt
              endsAt
              discountClass
            }
            ... on DiscountAutomaticBasic {
              title
              status
              startsAt
              endsAt
              summary
            }
            ... on DiscountAutomaticBxgy {
              title
              status
              startsAt
              endsAt
              summary
            }
            ... on DiscountAutomaticFreeShipping {
              title
              status
              startsAt
              endsAt
              summary
            }
          }
        }
      }
    }
  }
`

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "todas"

    console.log("🔍 Obteniendo promociones de Shopify GraphQL...")

    // Verificar credenciales
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Credenciales de Shopify no configuradas")
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales de Shopify no configuradas",
          promociones: [],
        },
        { status: 500 },
      )
    }

    // Hacer consulta GraphQL
    const response = await fetch(SHOPIFY_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: DISCOUNTS_QUERY,
        variables: {
          first: 50,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Error en GraphQL:", response.status, errorText)
      throw new Error(`Error GraphQL: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ Errores GraphQL:", data.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
    }

    const discountNodes = data.data?.discountNodes?.edges || []
    console.log(`✅ Descuentos obtenidos: ${discountNodes.length}`)

    // Procesar descuentos
    const promociones = discountNodes.map((edge: any) => {
      const node = edge.node
      const discount = node.discount

      // Extraer código si existe
      let codigo = null
      if (discount.codes?.edges?.length > 0) {
        codigo = discount.codes.edges[0].node.code
      }

      // Determinar tipo de descuento
      let tipo = "AUTOMATICO"
      let valor = 0

      if (discount.summary) {
        // Parsear el summary para obtener información del descuento
        const summary = discount.summary.toLowerCase()
        if (summary.includes("%")) {
          tipo = "PORCENTAJE_DESCUENTO"
          const match = summary.match(/(\d+)%/)
          if (match) valor = Number.parseInt(match[1])
        } else if (summary.includes("€") || summary.includes("$")) {
          tipo = "CANTIDAD_FIJA"
          const match = summary.match(/(\d+(?:\.\d+)?)[€$]/)
          if (match) valor = Number.parseFloat(match[1])
        } else if (summary.includes("shipping") || summary.includes("envío")) {
          tipo = "ENVIO_GRATIS"
        } else if (summary.includes("buy") && summary.includes("get")) {
          tipo = "COMPRA_X_LLEVA_Y"
        }
      }

      return {
        id: node.id,
        shopify_id: node.id,
        titulo: discount.title || "Promoción sin título",
        descripcion: discount.summary || "",
        tipo,
        valor,
        codigo,
        fecha_inicio: discount.startsAt,
        fecha_fin: discount.endsAt,
        estado: discount.status,
        activa: discount.status === "ACTIVE",
        limite_uso: discount.usageLimit,
        es_automatica: !codigo,
      }
    })

    // Filtrar según el parámetro
    let promocionesFiltradas = promociones
    if (filter === "activas") {
      promocionesFiltradas = promociones.filter((p) => p.estado === "ACTIVE")
    } else if (filter === "programadas") {
      promocionesFiltradas = promociones.filter((p) => p.estado === "SCHEDULED")
    } else if (filter === "expiradas") {
      promocionesFiltradas = promociones.filter((p) => p.estado === "EXPIRED")
    }

    console.log(`✅ Promociones filtradas (${filter}): ${promocionesFiltradas.length}`)

    return NextResponse.json({
      success: true,
      promociones: promocionesFiltradas,
      total: promocionesFiltradas.length,
    })
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener promociones",
        details: error instanceof Error ? error.message : "Error desconocido",
        promociones: [],
      },
      { status: 500 },
    )
  }
}
