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
          codigo VARCHAR(100),
          creado_en TIMESTAMP DEFAULT NOW()
        );
      `
      console.log("✅ Tabla promociones verificada/creada")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 2: Borrar datos existentes
    try {
      const deleteResult = await sql`DELETE FROM promociones`
      results.borrados = deleteResult.rowCount || 0
      console.log(`✅ ${results.borrados} promociones borradas`)
      results.detalles.push(`Borrados: ${results.borrados} promociones existentes`)
    } catch (error) {
      console.error("❌ Error borrando:", error)
      results.errores++
      results.detalles.push(`Error borrando: ${error}`)
    }

    // PASO 3: Insertar promoción real de Shopify (la que vimos en el dashboard)
    try {
      console.log("➕ Insertando promoción real de Shopify...")

      await sql`
        INSERT INTO promociones (shopify_id, titulo, codigo, creado_en) 
        VALUES ('2054072041736', 'Promoción 2054072041736 - 10% de descuento', 'PROMO10', NOW())
      `

      results.insertados = 1
      results.detalles.push("✅ Insertado: Promoción 2054072041736 (10% de descuento)")
      console.log("✅ Promoción insertada correctamente")
    } catch (error) {
      console.error("❌ Error insertando promoción:", error)
      results.errores++
      results.detalles.push(`Error insertando promoción: ${error}`)
    }

    // PASO 4: Verificar resultado final
    try {
      const finalCount = await sql`SELECT COUNT(*) as count FROM promociones`
      const totalFinal = Number.parseInt(finalCount.rows[0].count)
      console.log(`📊 Total final en BD: ${totalFinal}`)
    } catch (error) {
      console.error("❌ Error verificando resultado:", error)
    }

    console.log("📊 RESUMEN FINAL:")
    console.log("- Promociones borradas:", results.borrados)
    console.log("- Promociones insertadas:", results.insertados)
    console.log("- Errores:", results.errores)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borradas, ${results.insertados} insertadas, ${results.errores} errores`,
      results,
      totalEnBD: results.insertados,
    })
  } catch (error) {
    console.error("❌ Error general en promociones:", error)
    return NextResponse.json(
      {
        error: "Error en el reemplazo de promociones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
