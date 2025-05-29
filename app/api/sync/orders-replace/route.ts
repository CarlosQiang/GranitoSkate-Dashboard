import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { orders } = await request.json()

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "No se proporcionaron pedidos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando REEMPLAZO COMPLETO de pedidos...")
    console.log("📦 Pedidos recibidos:", orders.length)

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
            numero VARCHAR(100),
            cliente_id VARCHAR(255),
            cliente_nombre VARCHAR(500),
            cliente_email VARCHAR(255),
            total DECIMAL(10,2) DEFAULT 0,
            subtotal DECIMAL(10,2) DEFAULT 0,
            impuestos DECIMAL(10,2) DEFAULT 0,
            estado VARCHAR(50),
            fecha_creacion TIMESTAMP,
            fecha_actualizacion TIMESTAMP,
            moneda VARCHAR(10) DEFAULT 'EUR',
            items_count INTEGER DEFAULT 0,
            notas TEXT,
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

    // PASO 3: INSERTAR todos los pedidos nuevos
    console.log("➕ Insertando pedidos nuevos...")

    for (let i = 0; i < orders.length; i++) {
      const pedido = orders[i]

      try {
        console.log(`\n📝 Insertando pedido ${i + 1}/${orders.length}:`)
        console.log("- ID:", pedido.id)
        console.log("- Número:", pedido.name || pedido.order_number)

        // Limpiar y validar datos
        const shopifyId = String(pedido.id || "").replace("gid://shopify/Order/", "")
        const numero = String(pedido.name || pedido.order_number || "")
        const clienteId = String(pedido.customer?.id || "").replace("gid://shopify/Customer/", "")
        const clienteNombre = pedido.customer?.displayName || pedido.customer?.first_name || "Cliente sin nombre"
        const clienteEmail = pedido.customer?.email || ""
        const total = Number.parseFloat(String(pedido.totalPriceSet?.shopMoney?.amount || pedido.total_price || "0"))
        const subtotal = Number.parseFloat(
          String(pedido.subtotalPriceSet?.shopMoney?.amount || pedido.subtotal_price || "0"),
        )
        const impuestos = Number.parseFloat(String(pedido.totalTaxSet?.shopMoney?.amount || pedido.total_tax || "0"))
        const estado = String(pedido.displayFinancialStatus || pedido.financial_status || "pending")
        const fechaCreacion = pedido.createdAt || pedido.created_at || new Date().toISOString()
        const fechaActualizacion = pedido.updatedAt || pedido.updated_at || new Date().toISOString()
        const moneda = String(pedido.totalPriceSet?.shopMoney?.currencyCode || pedido.currency || "EUR")
        const itemsCount = Number.parseInt(String(pedido.lineItems?.length || pedido.line_items?.length || "0"))
        const notas = String(pedido.note || "")

        if (!shopifyId || !numero) {
          console.warn("⚠️ Pedido sin ID o número válido, saltando...")
          results.errores++
          results.detalles.push(`Error: Pedido ${i + 1} sin ID o número válido`)
          continue
        }

        // Insertar pedido
        await sql`
          INSERT INTO pedidos (
            shopify_id,
            numero,
            cliente_id,
            cliente_nombre,
            cliente_email,
            total,
            subtotal,
            impuestos,
            estado,
            fecha_creacion,
            fecha_actualizacion,
            moneda,
            items_count,
            notas,
            creado_en,
            actualizado_en
          ) VALUES (
            ${shopifyId},
            ${numero},
            ${clienteId},
            ${clienteNombre},
            ${clienteEmail},
            ${total},
            ${subtotal},
            ${impuestos},
            ${estado},
            ${fechaCreacion},
            ${fechaActualizacion},
            ${moneda},
            ${itemsCount},
            ${notas},
            NOW(),
            NOW()
          )
        `

        results.insertados++
        results.detalles.push(`✅ Insertado: Pedido ${numero}`)
        console.log(`✅ Pedido ${i + 1} insertado correctamente`)
      } catch (error) {
        console.error(`❌ Error insertando pedido ${i + 1}:`, error)
        results.errores++
        results.detalles.push(
          `❌ Error en pedido ${i + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
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
