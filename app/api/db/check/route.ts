import { NextResponse } from "next/server"
import { testConnection, query } from "@/lib/db/neon-client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Probar la conexión directa con el pool
    const poolConnected = await testConnection()

    if (!poolConnected) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al conectar con la base de datos usando el pool",
        },
        { status: 500 },
      )
    }

    // Realizar una consulta simple para verificar que todo funciona
    const result = await query("SELECT 1 as test")

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos establecida correctamente",
      details: {
        poolConnected,
        queryResult: result.rows,
      },
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar la conexión a la base de datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
