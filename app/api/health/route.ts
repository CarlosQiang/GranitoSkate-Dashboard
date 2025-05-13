import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const result = await sql`SELECT NOW()`

    // Verificar si la tabla administradores existe
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      );
    `

    const tableExists = tableCheck.rows[0].exists

    return NextResponse.json({
      status: "ok",
      timestamp: result.rows[0].now,
      database: {
        connected: true,
        administradores_table_exists: tableExists,
      },
    })
  } catch (error) {
    console.error("Error en health check:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al conectar con la base de datos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
