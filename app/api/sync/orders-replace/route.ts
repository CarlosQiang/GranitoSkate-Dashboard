import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de pedidos...")

    // Obtener TODOS los pedidos directamente de Shopify
    const ordersQuery = `
      query {
        orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                displayName
                email
                firstName
                lastName
              }
              financialStatus
              fulfillmentStatus
              tags
              note
              cancelledAt
              cancelReason
            }
          }
        }
      }
    `

    console.log("🔍 Obteniendo pedidos de Shopify...")
    const ordersResponse = await fetch(
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

    if (!ordersResponse.ok) {
      throw new Error(`Error de Shopify API: ${ordersResponse.status}`)
    }

    const ordersData = await ordersResponse.json()

    if (ordersData.errors) {
      console.error("❌ Errores de GraphQL:", ordersData.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(ordersData.errors)}`)
    }

    const orders = ordersData.data?.orders?.edges || []
    console.log(`📦 Pedidos obtenidos de Shopify: ${orders.length}`)

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [] as string[],
    }

    // 1. Crear tabla si no existe
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS pedidos (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          numero_pedido VARCHAR(100),
          cliente_id VARCHAR(255),
          email_cliente VARCHAR(255),
          estado VARCHAR(100),
          estado_financiero VARCHAR(100),
          estado_cumplimiento VARCHAR(100),
          moneda VARCHAR(10),
          total DECIMAL(10,2),
          notas TEXT,
          etiquetas TEXT,
          cancelado BOOLEAN DEFAULT FALSE,
          fecha_cancelacion TIMESTAMP,
          motivo_cancelacion VARCHAR(255),
          fecha_procesamiento TIMESTAMP,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla pedidos:", error)
    }

    // 2. Borrar todos los pedidos existentes
    try {
      const deleteResult = await sql`DELETE FROM pedidos`
      results.borrados = deleteResult.rowCount || 0
      results.detalles.push(`🗑️ Borrados: ${results.borrados} pedidos existentes`)
      console.log(`🗑️ ${results.borrados} pedidos borrados`)
    } catch (error) {
      console.error("❌ Error borrando pedidos:", error)
      results.errores++
      results.detalles.push(`❌ Error borrando: ${error}`)
    }

    // 3. Insertar los nuevos pedidos
    for (const edge of orders) {
      try {
        const order = edge.node
        const shopifyId = order.id.split("/").pop()
        const customerId = order.customer?.id ? order.customer.id.split("/").pop() : null

        await sql`
          INSERT INTO pedidos (
            shopify_id, numero_pedido, cliente_id, email_cliente, estado,
            estado_financiero, estado_cumplimiento, moneda, total,
            notas, etiquetas, cancelado, fecha_cancelacion, motivo_cancelacion,
            fecha_procesamiento
          ) VALUES (
            ${shopifyId},
            ${order.name},
            ${customerId},
            ${order.customer?.email || null},
            ${"open"},
            ${order.financialStatus || "pending"},
            ${order.fulfillmentStatus || "unfulfilled"},
            ${order.totalPriceSet?.shopMoney?.currencyCode || "EUR"},
            ${Number.parseFloat(order.totalPriceSet?.shopMoney?.amount || "0")},
            ${order.note || null},
            ${order.tags ? order.tags.join(",") : null},
            ${!!order.cancelledAt},
            ${order.cancelledAt ? new Date(order.cancelledAt).toISOString() : null},
            ${order.cancelReason || null},
            ${order.processedAt ? new Date(order.processedAt).toISOString() : new Date(order.createdAt).toISOString()}
          )
        `

        results.insertados++
        results.detalles.push(`✅ Pedido insertado: ${order.name} (${shopifyId})`)
        console.log(`✅ Pedido insertado: ${order.name} (${shopifyId})`)
      } catch (error) {
        console.error(`❌ Error insertando pedido:`, error)
        results.errores++
        results.detalles.push(`❌ Error insertando pedido: ${error}`)
      }
    }

    // 4. Contar total en BD
    const countResult = await sql`SELECT COUNT(*) as count FROM pedidos`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )
    console.log(`📊 Total en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error en reemplazo de pedidos:", error)
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
