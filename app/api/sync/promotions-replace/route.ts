import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de promociones...")

    // Obtener datos del dashboard
    const dashboardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/dashboard/summary`,
      {
        cache: "no-store",
      },
    )

    if (!dashboardResponse.ok) {
      throw new Error("Error al obtener datos del dashboard")
    }

    const dashboardData = await dashboardResponse.json()

    // Extraer promociones del dashboard
    const promociones = dashboardData.allPromotions || []
    console.log(`📊 Promociones obtenidas del dashboard: ${promociones.length}`)

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
            tipo VARCHAR(50),
            valor DECIMAL(10,2),
            activo BOOLEAN DEFAULT true,
            fecha_inicio TIMESTAMP,
            fecha_fin TIMESTAMP,
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

    // PASO 3: Insertar promociones
    if (!promociones.length) {
      console.log("⚠️ No hay promociones en el dashboard, insertando promoción de prueba...")

      try {
        // Insertar promoción de prueba
        await sql`
          INSERT INTO promociones (
            shopify_id, 
            titulo, 
            codigo, 
            tipo, 
            valor, 
            activo, 
            fecha_inicio, 
            fecha_fin, 
            creado_en, 
            actualizado_en
          ) VALUES (
            '2054072041736', 
            '10% de descuento', 
            'PROMO10', 
            'percentage', 
            10.00, 
            true, 
            NOW(), 
            NOW() + INTERVAL '30 days', 
            NOW(), 
            NOW()
          )
        `

        results.insertados = 1
        results.detalles.push("✅ Insertado: Promoción de prueba 10% de descuento")
      } catch (error) {
        console.error("❌ Error insertando promoción de prueba:", error)
        results.errores++
        results.detalles.push(`Error insertando promoción de prueba: ${error}`)
      }
    } else {
      console.log(`➕ Insertando ${promociones.length} promociones reales...`)

      for (const promocion of promociones) {
        try {
          const shopifyId =
            promocion.id?.toString().replace("gid://shopify/DiscountCode/", "") || `unknown_${Date.now()}`
          const titulo = promocion.title || promocion.code || "Sin título"
          const codigo = promocion.code || ""
          const tipo = promocion.type || "percentage"
          const valor = Number.parseFloat(promocion.value || "0")
          const activo = promocion.status === "active"
          const fechaInicio = promocion.starts_at || new Date().toISOString()
          const fechaFin = promocion.ends_at || null

          await sql`
            INSERT INTO promociones (
              shopify_id, 
              titulo, 
              codigo, 
              tipo, 
              valor, 
              activo, 
              fecha_inicio, 
              fecha_fin, 
              creado_en, 
              actualizado_en
            ) VALUES (
              ${shopifyId}, 
              ${titulo}, 
              ${codigo}, 
              ${tipo}, 
              ${valor}, 
              ${activo}, 
              ${fechaInicio}, 
              ${fechaFin}, 
              NOW(), 
              NOW()
            )
          `

          results.insertados++
          results.detalles.push(`✅ Insertado: ${titulo} (${codigo})`)
        } catch (error) {
          console.error(`❌ Error insertando promoción:`, error)
          results.errores++
          results.detalles.push(`Error insertando promoción: ${error}`)
        }
      }
    }

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
