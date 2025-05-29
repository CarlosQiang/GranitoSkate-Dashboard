import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { promotions } = await request.json()

    if (!promotions || !Array.isArray(promotions)) {
      return NextResponse.json({ error: "No se proporcionaron promociones para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando REEMPLAZO COMPLETO de promociones...")
    console.log("📦 Promociones recibidas:", promotions.length)

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
            codigo VARCHAR(100) NOT NULL,
            titulo VARCHAR(500),
            descripcion TEXT,
            tipo VARCHAR(50),
            valor DECIMAL(10,2) DEFAULT 0,
            fecha_inicio TIMESTAMP,
            fecha_fin TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'active',
            usos_totales INTEGER DEFAULT 0,
            usos_por_cliente INTEGER DEFAULT 1,
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
    console.log("➕ Insertando promociones nuevas...")

    for (let i = 0; i < promotions.length; i++) {
      const promocion = promotions[i]

      try {
        console.log(`\n📝 Insertando promoción ${i + 1}/${promotions.length}:`)
        console.log("- ID:", promocion.id)
        console.log("- Código:", promocion.code)

        // Limpiar y validar datos
        const shopifyId = String(promocion.id || "").replace("gid://shopify/DiscountCode/", "")
        const codigo = String(promocion.code || "")
        const titulo = String(promocion.title || promocion.code || "")
        const descripcion = String(promocion.summary || promocion.description || "")
        const tipo = String(promocion.type || "percentage")
        const valor = Number.parseFloat(String(promocion.value || promocion.amount || "0"))
        const fechaInicio = promocion.starts_at || promocion.created_at || new Date().toISOString()
        const fechaFin = promocion.ends_at || null
        const estado = String(promocion.status || "active")
        const usosTotales = Number.parseInt(String(promocion.usage_limit || "0"))
        const usosPorCliente = Number.parseInt(String(promocion.once_per_customer || "1"))

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
            codigo,
            titulo,
            descripcion,
            tipo,
            valor,
            fecha_inicio,
            fecha_fin,
            estado,
            usos_totales,
            usos_por_cliente,
            creado_en,
            actualizado_en
          ) VALUES (
            ${shopifyId},
            ${codigo},
            ${titulo},
            ${descripcion},
            ${tipo},
            ${valor},
            ${fechaInicio},
            ${fechaFin},
            ${estado},
            ${usosTotales},
            ${usosPorCliente},
            NOW(),
            NOW()
          )
        `

        results.insertados++
        results.detalles.push(`✅ Insertado: ${codigo}`)
        console.log(`✅ Promoción ${i + 1} insertada correctamente`)
      } catch (error) {
        console.error(`❌ Error insertando promoción ${i + 1}:`, error)
        results.errores++
        results.detalles.push(
          `❌ Error en promoción ${i + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
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
