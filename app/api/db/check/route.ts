import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Intentar ejecutar una consulta simple para verificar la conexión
    const result = await sql`SELECT 1 as check_connection`

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos establecida correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Error al verificar la conexión a la base de datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
