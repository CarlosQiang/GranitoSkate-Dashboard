import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Verificar la conexión a la base de datos
    const result = await sql`SELECT NOW() as time`

    return NextResponse.json({
      status: "ok",
      message: "Conexión a la base de datos establecida correctamente",
      timestamp: result.rows[0].time,
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al conectar con la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
