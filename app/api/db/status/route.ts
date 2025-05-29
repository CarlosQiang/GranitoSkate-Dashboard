import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("🔍 Verificando estado de las tablas...")

    const tablesStatus = {}

    // Verificar cada tabla
    const tables = ["productos", "pedidos", "clientes", "colecciones", "promociones", "theme_configs", "theme_settings"]

    for (const table of tables) {
      try {
        const result = await sql.query(`SELECT COUNT(*) as count FROM ${table}`)
        tablesStatus[table] = {
          exists: true,
          count: Number.parseInt(result.rows[0].count),
          error: null,
        }
      } catch (error) {
        tablesStatus[table] = {
          exists: false,
          count: 0,
          error: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    // Verificar configuración de personalización específicamente
    try {
      const themeConfigResult = await sql`
        SELECT COUNT(*) as count, shop_id, config_name 
        FROM theme_configs 
        GROUP BY shop_id, config_name
      `

      tablesStatus["theme_configs"].details = themeConfigResult.rows
    } catch (error) {
      console.error("Error verificando theme_configs:", error)
    }

    console.log("📊 Estado de las tablas:", tablesStatus)

    return NextResponse.json({
      success: true,
      tablesStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error verificando estado de tablas:", error)
    return NextResponse.json(
      {
        error: "Error verificando estado de las tablas",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
