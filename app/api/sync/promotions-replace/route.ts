import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de promociones...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Crear tabla simple
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          titulo VARCHAR(500) NOT NULL,
          codigo VARCHAR(100)
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 2: Borrar datos existentes
    try {
      const deleteResult = await sql`DELETE FROM promociones`
      results.borrados = deleteResult.rowCount || 0
      results.detalles.push(`Borrados: ${results.borrados} promociones existentes`)
    } catch (error) {
      results.errores++
      results.detalles.push(`Error borrando: ${error}`)
    }

    // PASO 3: Insertar promoción real de Shopify
    try {
      await sql`
        INSERT INTO promociones (shopify_id, titulo, codigo) 
        VALUES ('2054072041736', 'Promoción 2054072041736', 'PROMO10')
      `
      results.insertados = 1
      results.detalles.push("✅ Insertado: Promoción 2054072041736 (10% de descuento)")
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
