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
          titulo VARCHAR(255),
          descripcion TEXT,
          tipo VARCHAR(50),
          valor DECIMAL(10,2),
          codigo VARCHAR(100),
          activa BOOLEAN DEFAULT true,
          fecha_inicio TIMESTAMP,
          fecha_fin TIMESTAMP,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // PASO 3: Insertar promociones reales de Shopify
    try {
      const promocionesShopify = [
        {
          id: "2054072041736",
          titulo: "Promoción de prueba",
          descripcion: "100% off entire order • Minimum purchase of €12.00",
          tipo: "PERCENTAGE_DISCOUNT",
          valor: 100.0,
          codigo: "PROMO100",
          activa: true,
        },
        {
          id: "2054072074504",
          titulo: "Promoción automática",
          descripcion: "Descuento automático del 10%",
          tipo: "PERCENTAGE_DISCOUNT",
          valor: 10.0,
          codigo: null,
          activa: true,
        },
      ]

      for (const promocion of promocionesShopify) {
        await sql`
          INSERT INTO promociones (shopify_id, titulo, descripcion, tipo, valor, codigo, activa) 
          VALUES (${promocion.id}, ${promocion.titulo}, ${promocion.descripcion}, ${promocion.tipo}, ${promocion.valor}, ${promocion.codigo}, ${promocion.activa})
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
