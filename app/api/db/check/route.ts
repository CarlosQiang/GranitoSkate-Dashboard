import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkConnection } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar conexión a la base de datos
    const result = await checkConnection()

    if (!result.connected) {
      return NextResponse.json(
        {
          success: false,
          message: "Error al conectar con la base de datos",
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos establecida correctamente",
      timestamp: result.timestamp,
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      { error: "Error al verificar la base de datos", details: (error as Error).message },
      { status: 500 },
    )
  }
}
