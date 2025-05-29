import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("🔍 Verificando estructura de tablas...")

    // Verificar si las tablas existen
    const tables = ["productos", "pedidos", "clientes", "colecciones", "promociones"]
    const tableStatus: Record<string, any> = {}

    for (const tableName of tables) {
      try {
        // Verificar si la tabla existe
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
          );
        `

        if (tableExists.rows[0].exists) {
          // Contar registros
          const count = await sql.query(`SELECT COUNT(*) as count FROM "${tableName}"`)

          // Obtener estructura de la tabla
          const structure = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = ${tableName}
            ORDER BY ordinal_position;
          `

          tableStatus[tableName] = {
            exists: true,
            count: Number.parseInt(count.rows[0].count),
            structure: structure.rows,
          }
        } else {
          tableStatus[tableName] = {
            exists: false,
            count: 0,
            structure: [],
          }
        }
      } catch (error) {
        tableStatus[tableName] = {
          exists: false,
          count: 0,
          error: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    return NextResponse.json({
      success: true,
      tables: tableStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error verificando tablas:", error)
    return NextResponse.json(
      {
        error: "Error al verificar las tablas",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
