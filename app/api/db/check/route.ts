import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar si hay datos en las tablas principales
    const tables = ["productos", "colecciones", "clientes", "pedidos", "promociones"]
    let isEmpty = true
    let existingTables = []

    // Primero verificamos qué tablas existen realmente
    try {
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      existingTables = tablesResult.rows.map((row) => row.table_name)
    } catch (error) {
      console.error("Error al verificar tablas existentes:", error)
      // Si falla esta consulta, continuamos con el resto del código
    }

    // Solo verificamos las tablas que realmente existen
    for (const table of tables) {
      if (existingTables.includes(table)) {
        try {
          const result = await sql`SELECT COUNT(*) as count FROM ${sql.identifier(table)}`
          const count = Number.parseInt(result.rows[0].count)

          if (count > 0) {
            isEmpty = false
            break
          }
        } catch (error) {
          console.error(`Error al verificar tabla ${table}:`, error)
          // Continuamos con la siguiente tabla si hay error
        }
      }
    }

    return NextResponse.json({
      success: true,
      isEmpty,
      checkedTables: existingTables.filter((t) => tables.includes(t)),
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    // Devolvemos una respuesta de éxito falso pero con código 200 para evitar errores en cascada
    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 200 }, // Cambiamos a 200 para evitar errores en cascada
    )
  }
}
