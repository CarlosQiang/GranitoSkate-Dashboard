import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de clientes...")

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
    const clientes = dashboardData.allCustomers || []

    console.log(`📊 Clientes obtenidos del dashboard: ${clientes.length}`)

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Verificar/crear tabla clientes
    try {
      console.log("🔍 Verificando tabla clientes...")
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'clientes'
        );
      `

      if (!tableCheck.rows[0].exists) {
        console.log("📝 Creando tabla clientes...")
        await sql`
          CREATE TABLE clientes (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255),
            creado_en TIMESTAMP DEFAULT NOW(),
            actualizado_en TIMESTAMP DEFAULT NOW()
          );
        `
        console.log("✅ Tabla clientes creada")
      } else {
        console.log("✅ Tabla clientes ya existe")
      }
    } catch (error) {
      console.error("❌ Error con tabla clientes:", error)
      return NextResponse.json({ error: "Error con la tabla clientes" }, { status: 500 })
    }

    // PASO 2: BORRAR TODOS los clientes existentes
    try {
      console.log("🗑️ Borrando TODOS los clientes existentes...")
      const deleteResult = await sql`DELETE FROM clientes`
      results.borrados = deleteResult.rowCount || 0
      console.log(`✅ ${results.borrados} clientes borrados`)
      results.detalles.push(`Borrados: ${results.borrados} clientes existentes`)
    } catch (error) {
      console.error("❌ Error borrando clientes:", error)
      results.errores++
      results.detalles.push(`Error borrando clientes: ${error}`)
    }

    // PASO 3: INSERTAR todos los clientes nuevos
    console.log("➕ Insertando clientes nuevos...")

    for (let i = 0; i < clientes.length; i++) {
      const cliente = clientes[i]

      try {
        console.log(`\n📝 Insertando cliente ${i + 1}/${clientes.length}:`)
        console.log("- ID:", cliente.id)
        console.log("- Email:", cliente.email)

        // Limpiar y validar datos
        const shopifyId = String(cliente.id || "").replace("gid://shopify/Customer/", "")
        const email = String(cliente.email || `cliente_${shopifyId}@ejemplo.com`)

        if (!shopifyId) {
          console.warn("⚠️ Cliente sin ID válido, saltando...")
          results.errores++
          results.detalles.push(`Error: Cliente ${i + 1} sin ID válido`)
          continue
        }

        // Insertar cliente
        await sql`
          INSERT INTO clientes (
            shopify_id,
            email,
            creado_en,
            actualizado_en
          ) VALUES (
            ${shopifyId},
            ${email},
            NOW(),
            NOW()
          )
        `

        results.insertados++
        results.detalles.push(`✅ Insertado: ${email}`)
        console.log(`✅ Cliente ${i + 1} insertado correctamente`)
      } catch (error) {
        console.error(`❌ Error insertando cliente ${i + 1}:`, error)
        results.errores++
        results.detalles.push(
          `❌ Error en cliente ${i + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // PASO 4: Verificar resultado final
    const finalCount = await sql`SELECT COUNT(*) as count FROM clientes`
    const totalFinal = Number.parseInt(finalCount.rows[0].count)

    console.log("📊 RESUMEN FINAL:")
    console.log("- Clientes borrados:", results.borrados)
    console.log("- Clientes insertados:", results.insertados)
    console.log("- Errores:", results.errores)
    console.log("- Total en BD:", totalFinal)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD: totalFinal,
    })
  } catch (error) {
    console.error("❌ Error general en reemplazo de clientes:", error)
    return NextResponse.json(
      {
        error: "Error en el reemplazo de clientes",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
