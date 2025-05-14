import { NextResponse } from "next/server"
import db from "@/lib/db/vercel-postgres"

export async function GET() {
  try {
    // Intentar ejecutar una consulta simple
    const result = await db.executeQuery("SELECT NOW() as time")

    return NextResponse.json({
      status: "ok",
      message: "Conexión a la base de datos establecida correctamente",
      timestamp: result[0].time,
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Error al conectar con la base de datos",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
