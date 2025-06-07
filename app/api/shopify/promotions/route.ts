import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("🔍 Obteniendo promociones de Shopify usando GraphQL...")

    const shopifyUrl = process.env.SHOPIFY_API_URL
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyUrl || !accessToken) {
      console.error("❌ Credenciales de Shopify no configuradas")
      return NextResponse.json(
        {
          error: "Credenciales de Shopify no configuradas",
          promociones: [],
          total: 0,
        },
        { status: 500 },
      )
    }

    let promociones = []

    try {
      // Usar la query discountNodes según la documentación de Shopify
      const query = `
        query getDiscountNodes($first: Int!) {
          discountNodes(first: $first) {
            edges {
              node {
                id
                discount {
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
                          usageCount
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
                          usageCount
                        }
                      }
                    }
                    summary
                  }
                  ... on DiscountAutomaticBasic {
                    title
                    status
                    startsAt
                    endsAt
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

      const variables = {
        first: 50,
      }

      console.log("📤 Enviando query GraphQL a Shopify...")

      const response = await fetch(shopifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Error en la respuesta de Shopify (${response.status}):`, errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("📊 Respuesta de Shopify:", JSON.stringify(data, null, 2))

      if (data.errors) {
        console.error("❌ Errores en la respuesta GraphQL:", data.errors)

        // Si hay errores de permisos, intentar con REST API como fallback
        if (
          data.errors.some((error: any) => error.message.includes("access") || error.message.includes("permission"))
        ) {
          console.log("🔄 Intentando con REST API como fallback...")
          return await getPromotionsFromREST(shopifyUrl, accessToken)
        }

        throw new Error(`Errores GraphQL: ${data.errors.map((e: any) => e.message).join(", ")}`)
      }

      if (data.data && data.data.discountNodes && data.data.discountNodes.edges) {
        promociones = data.data.discountNodes.edges.map((edge: any) => {
          const node = edge.node
          const discount = node.discount

          // Extraer ID numérico
          const idParts = node.id.split("/")
          const numericId = idParts[idParts.length - 1]

          // Determinar tipo de descuento
          let tipo = "PORCENTAJE_DESCUENTO"
          let valor = 0
          let esAutomatica = false
          let codigo = ""

          // Verificar si es automático
          if (discount.__typename && discount.__typename.includes("Automatic")) {
            esAutomatica = true
          }

          // Obtener código si existe
          if (discount.codes && discount.codes.edges && discount.codes.edges.length > 0) {
            codigo = discount.codes.edges[0].node.code
          }

          // Obtener valor del descuento
          if (discount.customerGets && discount.customerGets.value) {
            if (discount.customerGets.value.percentage) {
              tipo = "PORCENTAJE_DESCUENTO"
              valor = Number.parseFloat(discount.customerGets.value.percentage)
            } else if (discount.customerGets.value.amount) {
              tipo = "CANTIDAD_FIJA_DESCUENTO"
              valor = Number.parseFloat(discount.customerGets.value.amount.amount)
            }
          }

          // Si es envío gratis
          if (discount.__typename && discount.__typename.includes("FreeShipping")) {
            tipo = "ENVIO_GRATIS"
            valor = 0
          }

          return {
            id: node.id,
            shopify_id: numericId,
            titulo: discount.title || `Promoción ${numericId}`,
            descripcion: discount.summary || "",
            tipo,
            valor,
            codigo,
            activa: discount.status === "ACTIVE",
            fecha_inicio: discount.startsAt || new Date().toISOString(),
            fecha_fin: discount.endsAt || null,
            es_automatica: esAutomatica,
            limite_uso: discount.usageLimit || null,
            contador_uso:
              discount.codes && discount.codes.edges.length > 0 ? discount.codes.edges[0].node.usageCount : 0,
          }
        })

        console.log(`✅ Se obtuvieron ${promociones.length} promociones de Shopify`)
      }
    } catch (error) {
      console.error("❌ Error obteniendo promociones con GraphQL:", error)

      // Intentar con REST API como fallback
      console.log("🔄 Intentando con REST API como fallback...")
      return await getPromotionsFromREST(shopifyUrl, accessToken)
    }

    // Si no se encontraron promociones, devolver array vacío
    if (promociones.length === 0) {
      console.log("⚠️ No se encontraron promociones en Shopify")
      return NextResponse.json({
        success: true,
        promociones: [],
        total: 0,
        message: "No se encontraron promociones en tu tienda Shopify",
      })
    }

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
        error: error instanceof Error ? error.message : "Error desconocido",
        promociones: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}

// Función fallback para usar REST API
async function getPromotionsFromREST(shopifyUrl: string, accessToken: string) {
  try {
    console.log("🔄 Usando REST API para obtener promociones...")

    // Convertir GraphQL URL a REST URL
    const restUrl = shopifyUrl.replace("/admin/api/2023-10/graphql.json", "/admin/api/2023-10")

    const response = await fetch(`${restUrl}/price_rules.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`REST API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("📊 Respuesta REST API:", data)

    const promociones = data.price_rules
      ? data.price_rules.map((rule: any) => ({
          id: `gid://shopify/PriceRule/${rule.id}`,
          shopify_id: rule.id.toString(),
          titulo: rule.title,
          descripcion: `${rule.value_type === "percentage" ? rule.value + "%" : rule.value + "€"} de descuento`,
          tipo: rule.value_type === "percentage" ? "PORCENTAJE_DESCUENTO" : "CANTIDAD_FIJA_DESCUENTO",
          valor: Number.parseFloat(rule.value),
          codigo: "",
          activa: rule.status === "active",
          fecha_inicio: rule.starts_at || new Date().toISOString(),
          fecha_fin: rule.ends_at || null,
          es_automatica: false,
          limite_uso: rule.usage_limit || null,
          contador_uso: 0,
        }))
      : []

    return NextResponse.json({
      success: true,
      promociones,
      total: promociones.length,
      source: "REST API",
    })
  } catch (error) {
    console.error("❌ Error con REST API fallback:", error)

    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron obtener las promociones de Shopify",
        promociones: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
