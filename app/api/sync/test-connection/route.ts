import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("🔍 Probando conexión a base de datos...")

    // Test básico de conexión
    const result = await sql`SELECT NOW() as current_time`
    console.log("✅ Conexión a BD exitosa:", result.rows[0])

    // Test de creación de tabla
    await sql`
      CREATE TABLE IF NOT EXISTS test_sync (
        id SERIAL PRIMARY KEY,
        mensaje VARCHAR(255),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log("✅ Tabla de prueba creada")

    // Test de inserción
    await sql`INSERT INTO test_sync (mensaje) VALUES ('Test de sincronización')`
    console.log("✅ Inserción de prueba exitosa")

    // Test de consulta
    const testResult = await sql`SELECT COUNT(*) as count FROM test_sync`
    console.log("✅ Consulta de prueba exitosa:", testResult.rows[0])

    // Limpiar tabla de prueba
    await sql`DROP TABLE IF EXISTS test_sync`
    console.log("✅ Tabla de prueba eliminada")

    return NextResponse.json({
      success: true,
      message: "Conexión y operaciones de BD funcionando correctamente",
      timestamp: new Date().toISOString(),
      dbTime: result.rows[0].current_time,
    })
  } catch (error) {
    console.error("❌ Error en test de conexión:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en test de conexión",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
