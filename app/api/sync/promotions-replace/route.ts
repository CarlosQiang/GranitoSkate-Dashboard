import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando reemplazo completo de promociones...")

    // Obtener TODAS las promociones directamente de Shopify
    const promotionsQuery = `
      query {
        discountNodes(first: 250) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticApp {
                  title
                  status
                  createdAt
                  updatedAt
                  appDiscountType {
                    appKey
                    functionId
                  }
                }
                ... on DiscountAutomaticBasic {
                  title
                  status
                  createdAt
                  updatedAt
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
                ... on DiscountCodeApp {
                  title
                  status
                  createdAt
                  updatedAt
                  appDiscountType {
                    appKey
                    functionId
                  }
                }
                ... on DiscountCodeBasic {
                  title
                  status
                  createdAt
                  updatedAt
                  codes(first: 10) {
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
                  usageLimit
                }
              }
            }
          }
        }
      }
    `

    console.log("🔍 Obteniendo promociones de Shopify...")
    const promotionsResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: promotionsQuery }),
      },
    )

    if (!promotionsResponse.ok) {
      throw new Error(`Error de Shopify API: ${promotionsResponse.status}`)
    }

    const promotionsData = await promotionsResponse.json()
    const promotions = promotionsData.data?.discountNodes?.edges || []

    console.log(`🎯 Promociones obtenidas de Shopify: ${promotions.length}`)

    // 1. Borrar todas las promociones existentes
    console.log("🗑️ Borrando promociones existentes...")
    const deleteResult = await query("DELETE FROM promociones")
    const borrados = deleteResult.rowCount || 0
    console.log(`🗑️ ${borrados} promociones borradas`)

    // 2. Insertar las nuevas promociones
    let insertados = 0
    let errores = 0

    for (const edge of promotions) {
      try {
        const node = edge.node
        const discount = node.discount
        const shopifyId = node.id.split("/").pop()

        if (!discount) {
          console.warn(`⚠️ Promoción sin datos de descuento: ${shopifyId}`)
          continue
        }

        // Extraer información común
        const title = discount.title || `Promoción ${shopifyId}`
        const status = discount.status || "ACTIVE"
        const createdAt = discount.createdAt || new Date().toISOString()
        const updatedAt = discount.updatedAt || new Date().toISOString()

        // Extraer valor y tipo de descuento
        let valor = 0
        let tipo = "PERCENTAGE"
        let codigo = ""
        let limite_uso = null
        let contador_uso = 0

        // Para descuentos con código
        if (discount.codes && discount.codes.edges.length > 0) {
          codigo = discount.codes.edges[0].node.code
          contador_uso = discount.codes.edges[0].node.usageCount || 0
        }

        // Para descuentos básicos (automáticos o con código)
        if (discount.customerGets?.value) {
          if (discount.customerGets.value.percentage !== undefined) {
            valor = discount.customerGets.value.percentage
            tipo = "PERCENTAGE"
          } else if (discount.customerGets.value.amount) {
            valor = Number.parseFloat(discount.customerGets.value.amount.amount)
            tipo = "FIXED_AMOUNT"
          }
        }

        // Límite de uso
        if (discount.usageLimit) {
          limite_uso = discount.usageLimit
        }

        // Insertar la promoción
        await query(
          `INSERT INTO promociones (
            shopify_id, titulo, descripcion, tipo, valor, codigo,
            activa, limite_uso, contador_uso, es_automatica
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )`,
          [
            shopifyId,
            title,
            `Promoción importada de Shopify - ${status}`,
            tipo,
            valor,
            codigo || null,
            status === "ACTIVE",
            limite_uso,
            contador_uso,
            !codigo, // Es automática si no tiene código
          ],
        )

        insertados++
        console.log(`✅ Promoción insertada: ${title} (${shopifyId})`)
      } catch (error) {
        console.error(`❌ Error insertando promoción:`, error)
        errores++
      }
    }

    // 3. Contar total en BD
    const countResult = await query("SELECT COUNT(*) as total FROM promociones")
    const totalEnBD = Number.parseInt(countResult.rows[0].total)

    console.log(`✅ Reemplazo completado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`)
    console.log(`🎯 Total en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`,
      results: {
        borrados,
        insertados,
        errores,
      },
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error en reemplazo de promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de promociones",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
