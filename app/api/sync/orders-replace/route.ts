import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de pedidos...")

    // Obtener datos del dashboard
    const dashboardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/dashboard/summary`,
      {
        cache: "no-store",
      },
    )

    if (!dashboardResponse.ok) {
      throw new Error("Error al obtener datos del dashboard")
    }

    const dashboardData = await dashboardResponse.json()

    // Extraer pedidos del dashboard
    const pedidos = dashboardData.recentOrders || []
    console.log(`📊 Pedidos obtenidos del dashboard: ${pedidos.length}`)

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Verificar/crear tabla pedidos
    try {
      console.log("🔍 Verificando tabla pedidos...")
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'pedidos'
        );
      `

      if (!tableCheck.rows[0].exists) {
        console.log("📝 Creando tabla pedidos...")
        await sql`
          CREATE TABLE pedidos (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255) UNIQUE NOT NULL,
            numero_pedido VARCHAR(100),
            email_cliente VARCHAR(255),
            estado VARCHAR(100),
            total DECIMAL(10,2),
            creado_en TIMESTAMP DEFAULT NOW(),
            actualizado_en TIMESTAMP DEFAULT NOW()
          );
        `
        console.log("✅ Tabla pedidos creada")
      } else {
        console.log("✅ Tabla pedidos ya existe")
      }
    } catch (error) {
      console.error("❌ Error con tabla pedidos:", error)
      return NextResponse.json({ error: "Error con la tabla pedidos" }, { status: 500 })
    }

    // PASO 2: BORRAR TODOS los pedidos existentes
    try {
      console.log("🗑️ Borrando TODOS los pedidos existentes...")
      const deleteResult = await sql`DELETE FROM pedidos`
      results.borrados = deleteResult.rowCount || 0
      console.log(`✅ ${results.borrados} pedidos borrados`)
      results.detalles.push(`Borrados: ${results.borrados} pedidos existentes`)
    } catch (error) {
      console.error("❌ Error borrando pedidos:", error)
      results.errores++
      results.detalles.push(`Error borrando pedidos: ${error}`)
    }

    // PASO 3: Insertar pedidos reales
    if (pedidos.length === 0) {
      console.log("⚠️ No hay pedidos en el dashboard")
      results.detalles.push("ℹ️ No hay pedidos disponibles para sincronizar")
    } else {
      console.log(`➕ Insertando ${pedidos.length} pedidos reales...`)

      for (const pedido of pedidos) {
        try {
          // Extraer datos del pedido
          const shopifyId = pedido.id?.toString().replace("gid://shopify/Order/", "") || `unknown_${Date.now()}`
          const numeroPedido = pedido.name || pedido.orderNumber || ""
          const emailCliente = pedido.customer?.email || pedido.email || ""
          const estado = pedido.displayFulfillmentStatus || pedido.financialStatus || "pendiente"
          const total = Number.parseFloat(pedido.totalPriceSet?.shopMoney?.amount || pedido.totalPrice || "0")

          console.log(`📝 Insertando pedido: ${numeroPedido} - ${emailCliente} - ${total}€`)

          // Insertar pedido
          await sql`
            INSERT INTO pedidos (
              shopify_id, 
              numero_pedido, 
              email_cliente, 
              estado, 
              total, 
              creado_en, 
              actualizado_en
            ) VALUES (
              ${shopifyId}, 
              ${numeroPedido}, 
              ${emailCliente}, 
              ${estado}, 
              ${total}, 
              NOW(), 
              NOW()
            )
          `

          results.insertados++
          results.detalles.push(`✅ Insertado: ${numeroPedido} (${emailCliente}) - ${total}€`)
        } catch (error) {
          console.error(`❌ Error insertando pedido:`, error)
          results.errores++
          results.detalles.push(`Error insertando pedido: ${error}`)
        }
      }
    }

    // PASO 4: Verificar resultado final
    const finalCount = await sql`SELECT COUNT(*) as count FROM pedidos`
    const totalFinal = Number.parseInt(finalCount.rows[0].count)

    console.log("📊 RESUMEN FINAL:")
    console.log("- Pedidos borrados:", results.borrados)
    console.log("- Pedidos insertados:", results.insertados)
    console.log("- Errores:", results.errores)
    console.log("- Total en BD:", totalFinal)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD: totalFinal,
    })
  } catch (error) {
    console.error("❌ Error general en reemplazo de pedidos:", error)
    return NextResponse.json(
      {
        error: "Error en el reemplazo de pedidos",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
