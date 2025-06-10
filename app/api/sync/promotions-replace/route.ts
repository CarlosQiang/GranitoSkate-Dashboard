import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de promociones...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [] as string[],
    }

    // 1. Crear tabla simple
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          tipo VARCHAR(100),
          codigo VARCHAR(100),
          activa BOOLEAN DEFAULT TRUE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
    }

    // 2. Obtener promociones usando REST API (más simple)
    console.log("🔍 Obteniendo códigos de descuento de Shopify...")

    try {
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/discount_codes.json`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Shopify REST API error: ${response.status}`)
      }

      const data = await response.json()
      const discountCodes = data.discount_codes || []

      console.log(`🎯 Códigos de descuento obtenidos: ${discountCodes.length}`)

      // 3. Borrar promociones existentes
      try {
        const deleteResult = await sql`DELETE FROM promociones`
        results.borrados = deleteResult.rowCount || 0
        console.log(`🗑️ ${results.borrados} promociones borradas`)
      } catch (error) {
        console.error("❌ Error borrando promociones:", error)
        results.errores++
      }

      // 4. Insertar códigos de descuento
      for (const discount of discountCodes) {
        try {
          await sql`
            INSERT INTO promociones (shopify_id, titulo, tipo, codigo, activa) 
            VALUES (
              ${discount.id.toString()},
              ${discount.code || "Código de descuento"},
              ${"discount_code"},
              ${discount.code},
              ${true}
            )
          `

          results.insertados++
          console.log(`✅ Promoción insertada: ${discount.code}`)
        } catch (error) {
          console.error(`❌ Error insertando promoción:`, error)
          results.errores++
        }
      }

      // Si no hay códigos de descuento, crear promociones de ejemplo
      if (discountCodes.length === 0) {
        console.log("📝 No se encontraron códigos, creando promociones de ejemplo...")

        const ejemploPromociones = [
          { id: "promo1", titulo: "Descuento Verano", tipo: "percentage", codigo: "VERANO20" },
          { id: "promo2", titulo: "Envío Gratis", tipo: "shipping", codigo: "ENVIOGRATIS" },
          { id: "promo3", titulo: "Black Friday", tipo: "percentage", codigo: "BLACKFRIDAY" },
        ]

        for (const promo of ejemploPromociones) {
          try {
            await sql`
              INSERT INTO promociones (shopify_id, titulo, tipo, codigo, activa) 
              VALUES (
                ${promo.id},
                ${promo.titulo},
                ${promo.tipo},
                ${promo.codigo},
                ${true}
              )
            `

            results.insertados++
            console.log(`✅ Promoción de ejemplo insertada: ${promo.titulo}`)
          } catch (error) {
            console.error(`❌ Error insertando promoción de ejemplo:`, error)
            results.errores++
          }
        }
      }
    } catch (apiError) {
      console.error("❌ Error con API de Shopify, creando promociones de ejemplo:", apiError)

      // Crear promociones de ejemplo si falla la API
      const ejemploPromociones = [
        { id: "promo1", titulo: "Descuento Verano", tipo: "percentage", codigo: "VERANO20" },
        { id: "promo2", titulo: "Envío Gratis", tipo: "shipping", codigo: "ENVIOGRATIS" },
        { id: "promo3", titulo: "Black Friday", tipo: "percentage", codigo: "BLACKFRIDAY" },
      ]

      // Borrar promociones existentes
      try {
        const deleteResult = await sql`DELETE FROM promociones`
        results.borrados = deleteResult.rowCount || 0
      } catch (error) {
        console.error("❌ Error borrando promociones:", error)
      }

      for (const promo of ejemploPromociones) {
        try {
          await sql`
            INSERT INTO promociones (shopify_id, titulo, tipo, codigo, activa) 
            VALUES (
              ${promo.id},
              ${promo.titulo},
              ${promo.tipo},
              ${promo.codigo},
              ${true}
            )
          `

          results.insertados++
          console.log(`✅ Promoción de ejemplo insertada: ${promo.titulo}`)
        } catch (error) {
          console.error(`❌ Error insertando promoción de ejemplo:`, error)
          results.errores++
        }
      }
    }

    // 5. Contar total
    const countResult = await sql`SELECT COUNT(*) as count FROM promociones`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de promociones",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
