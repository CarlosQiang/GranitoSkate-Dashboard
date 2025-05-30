import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de promociones...")

    // PASO 1: Crear tabla simple (si no existe)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          titulo VARCHAR(255),
          descripcion TEXT,
          codigo VARCHAR(100),
          tipo VARCHAR(50),
          valor NUMERIC(10, 2),
          activo BOOLEAN,
          fecha_inicio TIMESTAMP
        );
      `
      console.log("✅ Tabla promociones verificada/creada")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla promociones" }, { status: 500 })
    }

    // PASO 2: Borrar datos existentes
    let borrados = 0
    try {
      const deleteResult = await sql`DELETE FROM promociones`
      borrados = deleteResult.rowCount || 0
      console.log(`✅ ${borrados} promociones borradas`)
    } catch (error) {
      console.error("❌ Error borrando promociones:", error)
    }

    // PASO 3: Insertar promoción hardcodeada
    let insertados = 0
    try {
      const insertResult = await sql`
        INSERT INTO promociones 
        (shopify_id, titulo, descripcion, codigo, tipo, valor, activo, fecha_inicio) 
        VALUES 
        ('2054072041736', 'Promoción 10% de descuento', 'Descuento del 10% en todos los productos', 'PROMO10', 'porcentaje', 10.00, true, NOW())
      `
      insertados = 1
      console.log("✅ Promoción insertada correctamente")
    } catch (error) {
      console.error("❌ Error insertando promoción:", error)
      return NextResponse.json(
        {
          error: "Error insertando promoción",
          message: error instanceof Error ? error.message : "Error desconocido",
        },
        { status: 500 },
      )
    }

    // PASO 4: Verificar resultado
    let totalEnBD = 0
    try {
      const countResult = await sql`SELECT COUNT(*) as count FROM promociones`
      totalEnBD = Number.parseInt(countResult.rows[0].count)
      console.log(`📊 Total promociones en BD: ${totalEnBD}`)
    } catch (error) {
      console.error("❌ Error verificando resultado:", error)
    }

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${borrados} borradas, ${insertados} insertadas, 0 errores`,
      results: {
        borrados,
        insertados,
        errores: 0,
        detalles: ["✅ Insertado: Promoción 10% de descuento (PROMO10)"],
      },
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json(
      {
        error: "Error general",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
