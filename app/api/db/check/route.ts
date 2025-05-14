import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar la conexión a la base de datos
    const result = await sql`SELECT NOW() as timestamp`

    return NextResponse.json({
      status: "ok",
      message: "Conexión a la base de datos establecida correctamente",
      timestamp: result.rows[0].timestamp,
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)

    return NextResponse.json(
      {
        status: "error",
        message: `Error al conectar con la base de datos: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
