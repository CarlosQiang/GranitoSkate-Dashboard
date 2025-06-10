import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de pedidos...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [] as string[],
    }

    // 1. Crear tabla simple
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS pedidos (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          numero_pedido VARCHAR(100),
          email_cliente VARCHAR(255),
          estado VARCHAR(100),
          total DECIMAL(10,2),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
    }

    // 2. Obtener pedidos con consulta simple
    const ordersQuery = `
      query {
        orders(first: 50) {
          edges {
            node {
              id
              name
              email
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              financialStatus
              createdAt
            }
          }
        }
      }
    `

    console.log("🔍 Obteniendo pedidos de Shopify...")
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query: ordersQuery }),
      },
    )

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      console.error("GraphQL errors:", data.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
    }

    const orders = data.data?.orders?.edges || []
    console.log(`📦 Pedidos obtenidos: ${orders.length}`)

    // 3. Borrar pedidos existentes
    try {
      const deleteResult = await sql`DELETE FROM pedidos`
      results.borrados = deleteResult.rowCount || 0
      console.log(`🗑️ ${results.borrados} pedidos borrados`)
    } catch (error) {
      console.error("❌ Error borrando pedidos:", error)
      results.errores++
    }

    // 4. Insertar nuevos pedidos
    for (const edge of orders) {
      try {
        const order = edge.node
        const shopifyId = order.id.split("/").pop()

        await sql`
          INSERT INTO pedidos (shopify_id, numero_pedido, email_cliente, estado, total) 
          VALUES (
            ${shopifyId},
            ${order.name},
            ${order.email || "Sin email"},
            ${order.financialStatus || "pending"},
            ${Number.parseFloat(order.totalPriceSet?.shopMoney?.amount || "0")}
          )
        `

        results.insertados++
        console.log(`✅ Pedido insertado: ${order.name}`)
      } catch (error) {
        console.error(`❌ Error insertando pedido:`, error)
        results.errores++
      }
    }

    // 5. Contar total
    const countResult = await sql`SELECT COUNT(*) as count FROM pedidos`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de pedidos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
