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

    // PASO 1: Contar registros existentes antes de borrar
    try {
      const countResult = await sql`SELECT COUNT(*) as count FROM promociones`
      results.borrados = Number.parseInt(countResult.rows[0].count)
      console.log(`📊 Promociones existentes en BD: ${results.borrados}`)
    } catch (error) {
      console.log("ℹ️ Tabla promociones no existe, se creará nueva")
      results.borrados = 0
    }

    // PASO 2: Borrar tabla existente y crear nueva
    try {
      await sql`DROP TABLE IF EXISTS promociones`
      await sql`
        CREATE TABLE promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          titulo VARCHAR(255),
          descripcion TEXT,
          tipo VARCHAR(100),
          valor DECIMAL(10,2),
          codigo VARCHAR(100),
          fecha_inicio TIMESTAMP,
          fecha_fin TIMESTAMP,
          activa BOOLEAN DEFAULT true,
          estado VARCHAR(50),
          compra_minima DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
      console.log("✅ Tabla promociones recreada")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 3: Obtener promociones REALES de Shopify
    try {
      console.log("🔍 Obteniendo promociones reales de Shopify...")

      const shopifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/shopify/promotions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!shopifyResponse.ok) {
        throw new Error(`Error obteniendo promociones de Shopify: ${shopifyResponse.status}`)
      }

      const shopifyData = await shopifyResponse.json()
      const promocionesShopify = shopifyData.promociones || []

      console.log(`📊 Promociones encontradas en Shopify: ${promocionesShopify.length}`)

      // PASO 4: Insertar solo las promociones que existen en Shopify
      if (promocionesShopify.length > 0) {
        for (const promocion of promocionesShopify) {
          try {
            await sql`
              INSERT INTO promociones (
                shopify_id, 
                titulo, 
                descripcion, 
                tipo, 
                valor, 
                codigo, 
                fecha_inicio, 
                fecha_fin, 
                activa, 
                estado, 
                compra_minima
              ) 
              VALUES (
                ${promocion.shopify_id}, 
                ${promocion.titulo}, 
                ${promocion.descripcion || ""}, 
                ${promocion.tipo || "DESCUENTO"}, 
                ${promocion.valor || 0}, 
                ${promocion.codigo || null}, 
                ${promocion.fechaInicio || null}, 
                ${promocion.fechaFin || null}, 
                ${promocion.activa || true}, 
                ${promocion.estado || "ACTIVE"}, 
                ${promocion.compraMinima || null}
              )
            `
            results.insertados++
            results.detalles.push(`✅ Insertado: ${promocion.titulo}`)
            console.log(`✅ Promoción insertada: ${promocion.titulo}`)
          } catch (insertError) {
            results.errores++
            results.detalles.push(`❌ Error insertando ${promocion.titulo}: ${insertError}`)
            console.error(`❌ Error insertando promoción:`, insertError)
          }
        }
      } else {
        console.log("ℹ️ No hay promociones en Shopify, base de datos quedará vacía")
        results.detalles.push("ℹ️ No hay promociones en Shopify para sincronizar")
      }
    } catch (error) {
      console.error("❌ Error obteniendo promociones de Shopify:", error)
      results.errores++
      results.detalles.push(`❌ Error obteniendo datos de Shopify: ${error}`)
    }

    const message = `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`
    console.log(`✅ ${message}`)

    return NextResponse.json({
      success: true,
      message,
      results,
      totalEnBD: results.insertados,
      borrados: results.borrados,
      insertados: results.insertados,
      errores: results.errores,
    })
  } catch (error) {
    console.error("❌ Error general en sync promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error general en sincronización de promociones",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
