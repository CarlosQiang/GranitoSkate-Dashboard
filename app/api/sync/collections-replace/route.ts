import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { collections } = await request.json()

    if (!collections || !Array.isArray(collections)) {
      return NextResponse.json({ error: "No se proporcionaron colecciones para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando REEMPLAZO COMPLETO de colecciones...")
    console.log("📦 Colecciones recibidas:", collections.length)

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Verificar/crear tabla colecciones
    try {
      console.log("🔍 Verificando tabla colecciones...")
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'colecciones'
        );
      `

      if (!tableCheck.rows[0].exists) {
        console.log("📝 Creando tabla colecciones...")
        await sql`
          CREATE TABLE colecciones (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255) UNIQUE NOT NULL,
            titulo VARCHAR(500) NOT NULL,
            descripcion TEXT,
            imagen_url TEXT,
            publicada BOOLEAN DEFAULT true,
            productos_count INTEGER DEFAULT 0,
            creado_en TIMESTAMP DEFAULT NOW(),
            actualizado_en TIMESTAMP DEFAULT NOW()
          );
        `
        console.log("✅ Tabla colecciones creada")
      } else {
        console.log("✅ Tabla colecciones ya existe")
      }
    } catch (error) {
      console.error("❌ Error con tabla colecciones:", error)
      return NextResponse.json({ error: "Error con la tabla colecciones" }, { status: 500 })
    }

    // PASO 2: BORRAR TODAS las colecciones existentes
    try {
      console.log("🗑️ Borrando TODAS las colecciones existentes...")
      const deleteResult = await sql`DELETE FROM colecciones`
      results.borrados = deleteResult.rowCount || 0
      console.log(`✅ ${results.borrados} colecciones borradas`)
      results.detalles.push(`Borrados: ${results.borrados} colecciones existentes`)
    } catch (error) {
      console.error("❌ Error borrando colecciones:", error)
      results.errores++
      results.detalles.push(`Error borrando colecciones: ${error}`)
    }

    // PASO 3: INSERTAR todas las colecciones nuevas
    console.log("➕ Insertando colecciones nuevas...")

    for (let i = 0; i < collections.length; i++) {
      const coleccion = collections[i]

      try {
        console.log(`\n📝 Insertando colección ${i + 1}/${collections.length}:`)
        console.log("- ID:", coleccion.id)
        console.log("- Título:", coleccion.title)

        // Limpiar y validar datos
        const shopifyId = String(coleccion.id || "").replace("gid://shopify/Collection/", "")
        const titulo = String(coleccion.title || "Sin título")
        const descripcion = String(coleccion.description || "")
        const productosCount = Number.parseInt(String(coleccion.products_count || "0"))

        if (!shopifyId || !titulo) {
          console.warn("⚠️ Colección sin ID o título válido, saltando...")
          results.errores++
          results.detalles.push(`Error: Colección ${i + 1} sin ID o título válido`)
          continue
        }

        // Insertar colección
        await sql`
          INSERT INTO colecciones (
            shopify_id, 
            titulo, 
            descripcion, 
            imagen_url,
            publicada,
            productos_count,
            creado_en, 
            actualizado_en
          ) VALUES (
            ${shopifyId},
            ${titulo},
            ${descripcion},
            ${coleccion.image || null},
            true,
            ${productosCount},
            NOW(),
            NOW()
          )
        `

        results.insertados++
        results.detalles.push(`✅ Insertado: ${titulo}`)
        console.log(`✅ Colección ${i + 1} insertada correctamente`)
      } catch (error) {
        console.error(`❌ Error insertando colección ${i + 1}:`, error)
        results.errores++
        results.detalles.push(
          `❌ Error en colección ${i + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // PASO 4: Verificar resultado final
    const finalCount = await sql`SELECT COUNT(*) as count FROM colecciones`
    const totalFinal = Number.parseInt(finalCount.rows[0].count)

    console.log("📊 RESUMEN FINAL:")
    console.log("- Colecciones borradas:", results.borrados)
    console.log("- Colecciones insertadas:", results.insertados)
    console.log("- Errores:", results.errores)
    console.log("- Total en BD:", totalFinal)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borradas, ${results.insertados} insertadas, ${results.errores} errores`,
      results,
      totalEnBD: totalFinal,
    })
  } catch (error) {
    console.error("❌ Error general en reemplazo de colecciones:", error)
    return NextResponse.json(
      {
        error: "Error en el reemplazo de colecciones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
