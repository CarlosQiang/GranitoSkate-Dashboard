import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de promociones...")

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
          codigo VARCHAR(100),
          descuento_valor DECIMAL(10,2),
          descuento_tipo VARCHAR(50),
          fecha_inicio TIMESTAMP,
          fecha_fin TIMESTAMP,
          activa BOOLEAN DEFAULT TRUE,
          usos_limite INTEGER,
          usos_actuales INTEGER DEFAULT 0,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla promociones:", error)
    }

    // 2. Obtener descuentos automáticos
    const automaticDiscountsQuery = `
      query {
        automaticDiscountNodes(first: 50) {
          edges {
            node {
              id
              automaticDiscount {
                ... on DiscountAutomaticApp {
                  title
                  status
                  createdAt
                  updatedAt
                  startsAt
                  endsAt
                }
                ... on DiscountAutomaticBasic {
                  title
                  status
                  createdAt
                  updatedAt
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
                        }
                      }
                    }
                  }
                }
                ... on DiscountAutomaticBxgy {
                  title
                  status
                  createdAt
                  updatedAt
                  startsAt
                  endsAt
                }
              }
            }
          }
        }
      }
    `

    // 3. Obtener códigos de descuento
    const discountCodesQuery = `
      query {
        codeDiscountNodes(first: 50) {
          edges {
            node {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  status
                  codes(first: 10) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  createdAt
                  updatedAt
                  startsAt
                  endsAt
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
                        }
                      }
                    }
                  }
                }
                ... on DiscountCodeBxgy {
                  title
                  status
                  codes(first: 10) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  createdAt
                  updatedAt
                  startsAt
                  endsAt
                  usageLimit
                  asyncUsageCount
                }
                ... on DiscountCodeFreeShipping {
                  title
                  status
                  codes(first: 10) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  createdAt
                  updatedAt
                  startsAt
                  endsAt
                  usageLimit
                  asyncUsageCount
                }
              }
            }
          }
        }
      }
    `

    console.log("🔍 Obteniendo descuentos automáticos de Shopify...")
    const automaticResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query: automaticDiscountsQuery }),
      },
    )

    console.log("🔍 Obteniendo códigos de descuento de Shopify...")
    const codesResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query: discountCodesQuery }),
      },
    )

    const automaticData = await automaticResponse.json()
    const codesData = await codesResponse.json()

    const automaticDiscounts = automaticData.data?.automaticDiscountNodes?.edges || []
    const codeDiscounts = codesData.data?.codeDiscountNodes?.edges || []

    console.log(`🎯 Descuentos automáticos obtenidos: ${automaticDiscounts.length}`)
    console.log(`🎫 Códigos de descuento obtenidos: ${codeDiscounts.length}`)

    // 4. Borrar promociones existentes
    try {
      const deleteResult = await sql`DELETE FROM promociones`
      results.borrados = deleteResult.rowCount || 0
      results.detalles.push(`🗑️ Borrados: ${results.borrados} promociones existentes`)
      console.log(`🗑️ ${results.borrados} promociones borradas`)
    } catch (error) {
      console.error("❌ Error borrando promociones:", error)
      results.errores++
      results.detalles.push(`❌ Error borrando: ${error}`)
    }

    // 5. Insertar descuentos automáticos
    for (const edge of automaticDiscounts) {
      try {
        const discount = edge.node.automaticDiscount
        const shopifyId = edge.node.id.split("/").pop()

        let descuentoValor = 0
        let descuentoTipo = "percentage"

        if (discount.customerGets?.value) {
          if (discount.customerGets.value.percentage) {
            descuentoValor = discount.customerGets.value.percentage
            descuentoTipo = "percentage"
          } else if (discount.customerGets.value.amount) {
            descuentoValor = Number.parseFloat(discount.customerGets.value.amount.amount)
            descuentoTipo = "fixed_amount"
          }
        }

        await sql`
          INSERT INTO promociones (
            shopify_id, titulo, tipo, descuento_valor, descuento_tipo,
            fecha_inicio, fecha_fin, activa
          ) VALUES (
            ${shopifyId},
            ${discount.title || "Descuento Automático"},
            ${"automatic"},
            ${descuentoValor},
            ${descuentoTipo},
            ${discount.startsAt ? new Date(discount.startsAt).toISOString() : null},
            ${discount.endsAt ? new Date(discount.endsAt).toISOString() : null},
            ${discount.status === "ACTIVE"}
          )
        `

        results.insertados++
        results.detalles.push(`✅ Descuento automático insertado: ${discount.title} (${shopifyId})`)
        console.log(`✅ Descuento automático insertado: ${discount.title} (${shopifyId})`)
      } catch (error) {
        console.error(`❌ Error insertando descuento automático:`, error)
        results.errores++
        results.detalles.push(`❌ Error insertando descuento automático: ${error}`)
      }
    }

    // 6. Insertar códigos de descuento
    for (const edge of codeDiscounts) {
      try {
        const discount = edge.node.codeDiscount
        const shopifyId = edge.node.id.split("/").pop()
        const codigo = discount.codes?.edges?.[0]?.node?.code || null

        let descuentoValor = 0
        let descuentoTipo = "percentage"

        if (discount.customerGets?.value) {
          if (discount.customerGets.value.percentage) {
            descuentoValor = discount.customerGets.value.percentage
            descuentoTipo = "percentage"
          } else if (discount.customerGets.value.amount) {
            descuentoValor = Number.parseFloat(discount.customerGets.value.amount.amount)
            descuentoTipo = "fixed_amount"
          }
        }

        await sql`
          INSERT INTO promociones (
            shopify_id, titulo, tipo, codigo, descuento_valor, descuento_tipo,
            fecha_inicio, fecha_fin, activa, usos_limite, usos_actuales
          ) VALUES (
            ${shopifyId},
            ${discount.title || "Código de Descuento"},
            ${"code"},
            ${codigo},
            ${descuentoValor},
            ${descuentoTipo},
            ${discount.startsAt ? new Date(discount.startsAt).toISOString() : null},
            ${discount.endsAt ? new Date(discount.endsAt).toISOString() : null},
            ${discount.status === "ACTIVE"},
            ${discount.usageLimit || null},
            ${discount.asyncUsageCount || 0}
          )
        `

        results.insertados++
        results.detalles.push(`✅ Código de descuento insertado: ${discount.title} (${codigo}) (${shopifyId})`)
        console.log(`✅ Código de descuento insertado: ${discount.title} (${codigo}) (${shopifyId})`)
      } catch (error) {
        console.error(`❌ Error insertando código de descuento:`, error)
        results.errores++
        results.detalles.push(`❌ Error insertando código de descuento: ${error}`)
      }
    }

    // 7. Contar total en BD
    const countResult = await sql`SELECT COUNT(*) as count FROM promociones`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )
    console.log(`🎯 Total en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
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
