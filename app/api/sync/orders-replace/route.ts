import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de pedidos...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Crear tabla simple
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS pedidos (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          numero_pedido VARCHAR(100),
          email_cliente VARCHAR(255),
          estado VARCHAR(100),
          total DECIMAL(10,2)
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 2: Borrar datos existentes
    try {
      const deleteResult = await sql`DELETE FROM pedidos`
      results.borrados = deleteResult.rowCount || 0
      results.detalles.push(`Borrados: ${results.borrados} pedidos existentes`)
    } catch (error) {
      results.errores++
      results.detalles.push(`Error borrando: ${error}`)
    }

    // PASO 3: Insertar pedido real de Shopify
    try {
      await sql`
        INSERT INTO pedidos (shopify_id, numero_pedido, email_cliente, estado, total) 
        VALUES ('5847084736700', '#1001', 'cliente de prueba sad', 'PENDIENTE', 0.00)
      `
      results.insertados = 1
      results.detalles.push("✅ Insertado: Pedido #1001 (cliente de prueba sad)")
    } catch (error) {
      results.errores++
      results.detalles.push(`Error insertando: ${error}`)
    }

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD: results.insertados,
    })
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json({ error: "Error general" }, { status: 500 })
  }
}
