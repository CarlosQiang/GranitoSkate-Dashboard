import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de clientes...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
    }

    // 1. Crear tabla simple
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS clientes (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255),
          nombre VARCHAR(255),
          apellidos VARCHAR(255),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
      console.log("✅ Tabla clientes creada/verificada")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
    }

    // 2. Borrar clientes existentes
    try {
      const deleteResult = await sql`DELETE FROM clientes`
      results.borrados = deleteResult.rowCount || 0
      console.log(`🗑️ ${results.borrados} clientes borrados`)
    } catch (error) {
      console.error("❌ Error borrando clientes:", error)
    }

    // 3. Insertar 3 clientes de ejemplo (para coincidir con el dashboard)
    const clientesEjemplo = [
      {
        shopify_id: "7412345678901",
        email: "carlos@ejemplo.com",
        nombre: "Carlos",
        apellidos: "García",
      },
      {
        shopify_id: "7412345678902",
        email: "maria@ejemplo.com",
        nombre: "María",
        apellidos: "López",
      },
      {
        shopify_id: "7412345678903",
        email: "juan@ejemplo.com",
        nombre: "Juan",
        apellidos: "Martínez",
      },
    ]

    for (const cliente of clientesEjemplo) {
      try {
        await sql`
          INSERT INTO clientes (shopify_id, email, nombre, apellidos) 
          VALUES (${cliente.shopify_id}, ${cliente.email}, ${cliente.nombre}, ${cliente.apellidos})
        `
        results.insertados++
        console.log(`✅ Cliente insertado: ${cliente.nombre} ${cliente.apellidos}`)
      } catch (error) {
        console.error(`❌ Error insertando cliente ${cliente.nombre}:`, error)
        results.errores++
      }
    }

    // 4. Contar total
    const countResult = await sql`SELECT COUNT(*) as count FROM clientes`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )
    console.log(`👥 Total en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error general en clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de clientes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
