import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    const tablesStatus: Record<string, any> = {}

    // Lista de tablas a verificar
    const tables = ["productos", "pedidos", "clientes", "colecciones", "promociones", "theme_configs", "theme_settings"]

    for (const tableName of tables) {
      try {
        // Verificar si la tabla existe y contar registros
        const result = await sql`
          SELECT COUNT(*) as count 
          FROM ${sql(tableName)}
        `

        tablesStatus[tableName] = {
          exists: true,
          count: Number.parseInt(result.rows[0].count),
          error: null,
        }
      } catch (error) {
        tablesStatus[tableName] = {
          exists: false,
          count: 0,
          error: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    return NextResponse.json({
      success: true,
      tablesStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json(
      {
        error: "Error al verificar el estado de la base de datos",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
