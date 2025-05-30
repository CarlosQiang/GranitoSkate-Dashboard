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
            descripcion TEXT,
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

    // PASO 3: INSERTAR todas las promociones nuevas
    if (promociones.length === 0) {
      console.log("ℹ️ No hay promociones para sincronizar")
      results.detalles.push("ℹ️ No hay promociones disponibles en Shopify")
    } else {
      console.log("➕ Insertando promociones nuevas...")

      for (let i = 0; i < promociones.length; i++) {
        const promocion = promociones[i]

        try {
          console.log(`\n📝 Insertando promoción ${i + 1}/${promociones.length}:`)
          console.log("- ID:", promocion.id)
          console.log("- Código:", promocion.code)

          // Limpiar y validar datos
          const shopifyId = String(promocion.id || "").replace("gid://shopify/DiscountCode/", "")
          const titulo = String(promocion.title || promocion.code || "Promoción sin título")
          const descripcion = String(promocion.description || "")
          const codigo = String(promocion.code || "")
          const tipo = String(promocion.type || "percentage")
          const valor = Number.parseFloat(String(promocion.value || "0"))
          const activo = Boolean(promocion.status === "active")
          const fechaInicio = promocion.starts_at || promocion.created_at || new Date().toISOString()
          const fechaFin = promocion.ends_at || null

          if (!shopifyId || !codigo) {
            console.warn("⚠️ Promoción sin ID o código válido, saltando...")
            results.errores++
            results.detalles.push(`Error: Promoción ${i + 1} sin ID o código válido`)
            continue
          }

          // Insertar promoción
          await sql`
            INSERT INTO promociones (
              shopify_id,
              titulo,
              descripcion,
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
              ${descripcion},
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
          results.detalles.push(`✅ Insertado: ${codigo} (${titulo})`)
          console.log(`✅ Promoción ${i + 1} insertada correctamente`)
        } catch (error) {
          console.error(`❌ Error insertando promoción ${i + 1}:`, error)
          results.errores++
          results.detalles.push(
            `❌ Error en promoción ${i + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`,
          )
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
