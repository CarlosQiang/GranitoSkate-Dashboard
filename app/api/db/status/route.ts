import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("🔍 Verificando estado de las tablas...")

    const tablesStatus: Record<string, any> = {}

    // Lista de tablas a verificar
    const tables = ["productos", "pedidos", "clientes", "colecciones", "promociones", "theme_configs", "theme_settings"]

    for (const tableName of tables) {
      try {
        // Verificar si la tabla existe y contar registros
        // Usamos sql.query en lugar de sql`` para evitar problemas con nombres de tabla
        const result = await sql.query(`SELECT COUNT(*) as count FROM "${tableName}"`)

        tablesStatus[tableName] = {
          exists: true,
          count: Number.parseInt(result.rows[0].count.toString()),
          error: null,
        }
      } catch (error) {
        console.error(`Error verificando tabla ${tableName}:`, error)
        tablesStatus[tableName] = {
          exists: false,
          count: 0,
          error: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    console.log("📊 Estado de las tablas:", tablesStatus)

    return NextResponse.json({
      success: true,
      tablesStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error verificando estado de la base de datos:", error)
    return NextResponse.json(
      {
        error: "Error al verificar el estado de la base de datos",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
