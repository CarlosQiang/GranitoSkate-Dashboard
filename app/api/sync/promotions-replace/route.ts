import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de promociones...")

    // 1. Obtener promociones directamente usando GraphQL (sin llamada interna)
    console.log("📡 Obteniendo promociones directamente de Shopify...")

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error("Variables de entorno de Shopify no configuradas")
    }

    // Query GraphQL para obtener descuentos
    const graphqlQuery = `
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
        body: JSON.stringify({ query: graphqlQuery }),
      },
    )

    if (!shopifyResponse.ok) {
      throw new Error(`Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
    }

    const shopifyData = await shopifyResponse.json()

    if (shopifyData.errors) {
      throw new Error(`Errores en GraphQL: ${shopifyData.errors.map((e) => e.message).join(", ")}`)
    }

    // Procesar las promociones
    const promociones =
      shopifyData.data?.discountNodes?.edges?.map((edge) => {
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

        return {
          shopify_id: node.id,
          titulo: discount.title || "Promoción sin título",
          descripcion: discount.summary || "",
          tipo: tipo,
          valor: valor,
          codigo: isCodeDiscount ? discount.codes?.nodes?.[0]?.code || null : null,
          fecha_inicio: discount.startsAt ? new Date(discount.startsAt) : null,
          fecha_fin: discount.endsAt ? new Date(discount.endsAt) : null,
          activa: discount.status === "ACTIVE",
          estado: discount.status || "ACTIVE",
        }
      }) || []

    console.log(`📊 Promociones obtenidas de Shopify: ${promociones.length}`)

    // 2. Borrar todas las promociones existentes
    console.log("🗑️ Borrando promociones existentes...")
    const deleteResult = await query("DELETE FROM promociones")
    const borrados = deleteResult.rowCount || 0
    console.log(`✅ ${borrados} promociones borradas`)

    let insertados = 0
    let errores = 0
    const detalles = []

    // 3. Insertar las nuevas promociones
    for (const promocion of promociones) {
      try {
        console.log(`💾 Insertando promoción: ${promocion.titulo}`)

        const result = await query(
          `INSERT INTO promociones (
            shopify_id, titulo, descripcion, tipo, valor, codigo,
            fecha_inicio, fecha_fin, activa, estado
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
          RETURNING id`,
          [
            promocion.shopify_id,
            promocion.titulo,
            promocion.descripcion,
            promocion.tipo,
            promocion.valor,
            promocion.codigo,
            promocion.fecha_inicio,
            promocion.fecha_fin,
            promocion.activa,
            promocion.estado,
          ],
        )

        if (result.rows.length > 0) {
          insertados++
          console.log(`✅ Promoción insertada: ${promocion.titulo} (ID: ${result.rows[0].id})`)
          detalles.push({
            shopify_id: promocion.shopify_id,
            titulo: promocion.titulo,
            resultado: "insertado",
          })
        }
      } catch (error) {
        errores++
        console.error(`❌ Error insertando promoción:`, error)
        detalles.push({
          shopify_id: promocion.shopify_id,
          titulo: promocion.titulo,
          resultado: "error",
          error: error.message,
        })
      }
    }

    // 4. Verificar el resultado final
    const finalCountResult = await query("SELECT COUNT(*) as total FROM promociones")
    const totalEnBD = Number.parseInt(finalCountResult.rows[0].total)

    console.log(`✅ Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`)
    console.log(`📊 Total de promociones en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`,
      results: {
        borrados,
        insertados,
        errores,
        detalles,
      },
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error en reemplazo de promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de promociones",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
