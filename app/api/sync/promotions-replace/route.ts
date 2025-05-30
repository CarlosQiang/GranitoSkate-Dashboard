import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de promociones...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Verificar/crear tabla promociones
    try {
      console.log("🔍 Verificando tabla promociones...")
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'promociones'
        );
      `

      if (!tableCheck.rows[0].exists) {
        console.log("📝 Creando tabla promociones...")
        await sql`
          CREATE TABLE promociones (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255) UNIQUE NOT NULL,
            titulo VARCHAR(500) NOT NULL,
            codigo VARCHAR(100),
            creado_en TIMESTAMP DEFAULT NOW(),
            actualizado_en TIMESTAMP DEFAULT NOW()
          );
        `
        console.log("✅ Tabla promociones creada")
      } else {
        console.log("✅ Tabla promociones ya existe")
      }
    } catch (error) {
      console.error("❌ Error con tabla promociones:", error)
      return NextResponse.json({ error: "Error con la tabla promociones" }, { status: 500 })
    }

    // PASO 2: BORRAR TODAS las promociones existentes
    try {
      console.log("🗑️ Borrando TODAS las promociones existentes...")
      const deleteResult = await sql`DELETE FROM promociones`
      results.borrados = deleteResult.rowCount || 0
      console.log(`✅ ${results.borrados} promociones borradas`)
      results.detalles.push(`Borrados: ${results.borrados} promociones existentes`)
    } catch (error) {
      console.error("❌ Error borrando promociones:", error)
      results.errores++
      results.detalles.push(`Error borrando promociones: ${error}`)
    }

    // PASO 3: No hay promociones para insertar
    console.log("ℹ️ No hay promociones para sincronizar desde Shopify")
    results.detalles.push("ℹ️ No hay promociones disponibles en Shopify para sincronizar")

    // PASO 4: Verificar resultado final
    const finalCount = await sql`SELECT COUNT(*) as count FROM promociones`
    const totalFinal = Number.parseInt(finalCount.rows[0].count)

    console.log("📊 RESUMEN FINAL:")
    console.log("- Promociones borradas:", results.borrados)
    console.log("- Promociones insertadas:", results.insertados)
    console.log("- Errores:", results.errores)
    console.log("- Total en BD:", totalFinal)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borradas, ${results.insertados} insertadas, ${results.errores} errores`,
      results,
      totalEnBD: totalFinal,
    })
  } catch (error) {
    console.error("❌ Error general en reemplazo de promociones:", error)
    return NextResponse.json(
      {
        error: "Error en el reemplazo de promociones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
