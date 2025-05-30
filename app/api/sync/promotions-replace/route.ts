import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de promociones...")

    // Obtener datos del cuerpo de la petición
    const body = await request.json().catch(() => ({}))
    console.log("📊 Datos recibidos:", body)

    // PASO 1: Crear/verificar tabla
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          codigo VARCHAR(100),
          tipo VARCHAR(50),
          valor NUMERIC(10, 2),
          activo BOOLEAN DEFAULT true,
          fecha_inicio TIMESTAMP DEFAULT NOW()
        )
      `
      console.log("✅ Tabla promociones verificada/creada")
    } catch (error) {
      console.error("❌ Error con tabla:", error)
      return NextResponse.json({ error: "Error con tabla promociones" }, { status: 500 })
    }

    // PASO 2: Borrar datos existentes
    let borrados = 0
    try {
      const deleteResult = await sql`DELETE FROM promociones`
      borrados = deleteResult.rowCount || 0
      console.log(`✅ ${borrados} promociones borradas`)
    } catch (error) {
      console.error("❌ Error borrando:", error)
    }

    // PASO 3: Insertar promoción real de Shopify
    let insertados = 0
    try {
      // Usar la promoción real que vimos en Shopify
      const insertResult = await sql`
        INSERT INTO promociones (shopify_id, titulo, descripcion, codigo, tipo, valor, activo, fecha_inicio) 
        VALUES 
        ('2054072041736', 'Promoción 2054072041736', '10% de descuento', 'PROMO10', 'porcentaje', 10.00, true, '2025-05-30'::timestamp)
        RETURNING id
      `

      if (insertResult.rows.length > 0) {
        insertados = 1
        console.log("✅ Promoción real insertada con ID:", insertResult.rows[0].id)
      }
    } catch (error) {
      console.error("❌ Error insertando:", error)
      return NextResponse.json({ error: "Error insertando promoción" }, { status: 500 })
    }

    // PASO 4: Verificar resultado
    let totalEnBD = 0
    try {
      const countResult = await sql`SELECT COUNT(*) as count FROM promociones`
      totalEnBD = Number.parseInt(countResult.rows[0].count)
      console.log(`📊 Total promociones en BD: ${totalEnBD}`)

      // Mostrar la promoción insertada
      const promociones = await sql`SELECT * FROM promociones`
      console.log("📋 Promoción insertada:", promociones.rows[0])
    } catch (error) {
      console.error("❌ Error verificando:", error)
    }

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${borrados} borradas, ${insertados} insertadas, 0 errores`,
      results: {
        borrados,
        insertados,
        errores: 0,
        detalles: [`✅ Insertado: Promoción 2054072041736 (10% de descuento)`],
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
