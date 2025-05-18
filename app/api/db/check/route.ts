import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Intentar ejecutar una consulta simple
    const result = await query(`SELECT 1 as connected`)

    // Verificar tablas existentes
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    const tables = tablesResult.rows.map((row: any) => row.table_name)

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos establecida correctamente",
      tables,
      connected: true,
    })
  } catch (error: any) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        connected: false,
      },
      { status: 500 },
    )
  }
}
