import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar si hay datos en las tablas principales
    const tables = ["productos", "colecciones", "clientes", "pedidos", "promociones"]
    let isEmpty = true

    for (const table of tables) {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql.identifier(table)}`
      const count = Number.parseInt(result.rows[0].count)

      if (count > 0) {
        isEmpty = false
        break
      }
    }

    return NextResponse.json({
      success: true,
      isEmpty,
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la base de datos",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
