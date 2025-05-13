import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      );
    `

    const tableExists = result.rows[0]?.exists || false

    return NextResponse.json({
      status: "ok",
      database: {
        connected: true,
        administradoresTable: tableExists,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en health check:", error)

    return NextResponse.json(
      {
        status: "error",
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
