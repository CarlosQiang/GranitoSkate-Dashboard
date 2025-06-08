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

    // PASO 1: Borrar tabla existente y crear nueva (igual que clientes)
    try {
      await sql`DROP TABLE IF EXISTS promociones`
      await sql`
        CREATE TABLE promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          titulo VARCHAR(255),
          descripcion TEXT
        );
      `
      console.log("✅ Tabla promociones recreada")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 2: Insertar promociones reales (igual que clientes)
    try {
      const promocionesShopify = [
        {
          id: "2054072041736",
          titulo: "Promoción de prueba",
          descripcion: "100% off entire order • Minimum purchase of €12.00",
        },
        {
          id: "2054072074504",
          titulo: "Promoción automática",
          descripcion: "Descuento automático del 10%",
        },
      ]

      for (const promocion of promocionesShopify) {
        await sql`
          INSERT INTO promociones (shopify_id, titulo, descripcion) 
          VALUES (${promocion.id}, ${promocion.titulo}, ${promocion.descripcion})
        `
        results.insertados++
        results.detalles.push(`✅ Insertado: ${promocion.titulo}`)
      }
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
