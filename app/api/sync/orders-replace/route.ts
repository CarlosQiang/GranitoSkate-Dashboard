import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de pedidos...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Verificar/crear tabla pedidos (ultra-simplificada)
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
            shopify_id VARCHAR(255) UNIQUE NOT NULL
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

    // PASO 3: Insertar un pedido de prueba
    try {
      console.log("➕ Insertando pedido de prueba...")
      await sql`
        INSERT INTO pedidos (shopify_id) 
        VALUES ('test_order_1')
      `
      results.insertados = 1
      results.detalles.push("✅ Insertado: Pedido de prueba")
    } catch (error) {
      console.error("❌ Error insertando pedido de prueba:", error)
      results.errores++
      results.detalles.push(`Error insertando pedido de prueba: ${error}`)
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
