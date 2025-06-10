import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de promociones REALES...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [] as string[],
    }

    // 1. Crear tabla si no existe
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          tipo VARCHAR(100),
          valor DECIMAL(10,2),
          codigo VARCHAR(100),
          estado VARCHAR(50),
          activa BOOLEAN DEFAULT TRUE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
    }

    // 2. Obtener promociones REALES de Shopify usando GraphQL
    console.log("🔍 Obteniendo promociones REALES de Shopify...")

    const promotionsQuery = `
      query {
        discountNodes(first: 100) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticApp {
                  title
                  status
                  createdAt
                  updatedAt
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
                        }
                      }
                    }
                  }
                }
                ... on DiscountCodeApp {
                  title
                  status
                  createdAt
                  updatedAt
                }
                ... on DiscountCodeBasic {
                  title
                  status
                  createdAt
                  updatedAt
                  codes(first: 1) {
                    edges {
                      node {
                        code
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

    try {
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
          },
          body: JSON.stringify({ query: promotionsQuery }),
        },
      )

      if (!response.ok) {
        throw new Error(`Shopify GraphQL API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`)
      }

      const promotions = data.data?.discountNodes?.edges || []
      console.log(`🎯 Promociones REALES obtenidas de Shopify: ${promotions.length}`)

      // 3. Borrar promociones existentes
      try {
        const deleteResult = await sql`DELETE FROM promociones`
        results.borrados = deleteResult.rowCount || 0
        console.log(`🗑️ ${results.borrados} promociones borradas`)
      } catch (error) {
        console.error("❌ Error borrando promociones:", error)
        results.errores++
      }

      // 4. Insertar promociones REALES
      for (const edge of promotions) {
        try {
          const node = edge.node
          const discount = node.discount

          if (!discount) continue

          // Extraer información del descuento
          const titulo = discount.title || "Promoción sin título"
          const estado = discount.status || "ACTIVE"

          let valor = 0
          let tipo = "PERCENTAGE"
          let codigo = ""

          // Extraer valor del descuento
          if (discount.customerGets?.value) {
            if (discount.customerGets.value.percentage) {
              valor = discount.customerGets.value.percentage * 100 // Convertir a porcentaje
              tipo = "PERCENTAGE"
            } else if (discount.customerGets.value.amount?.amount) {
              valor = Number.parseFloat(discount.customerGets.value.amount.amount)
              tipo = "FIXED_AMOUNT"
            }
          }

          // Extraer código si existe
          if (discount.codes?.edges?.[0]?.node?.code) {
            codigo = discount.codes.edges[0].node.code
          }

          await sql`
            INSERT INTO promociones (shopify_id, titulo, tipo, valor, codigo, estado, activa) 
            VALUES (
              ${node.id},
              ${titulo},
              ${tipo},
              ${valor},
              ${codigo || null},
              ${estado},
              ${estado === "ACTIVE"}
            )
          `

          results.insertados++
          console.log(`✅ Promoción REAL insertada: ${titulo} (${tipo}: ${valor})`)
          results.detalles.push(`${titulo} - ${tipo}: ${valor}`)
        } catch (error) {
          console.error(`❌ Error insertando promoción:`, error)
          results.errores++
        }
      }
    } catch (apiError) {
      console.error("❌ Error obteniendo promociones de Shopify:", apiError)
      results.errores++
      return NextResponse.json(
        {
          success: false,
          error: "Error obteniendo promociones de Shopify",
          details: apiError instanceof Error ? apiError.message : "Error desconocido",
        },
        { status: 500 },
      )
    }

    // 5. Contar total final
    const countResult = await sql`SELECT COUNT(*) as count FROM promociones`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error general:", error)
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
