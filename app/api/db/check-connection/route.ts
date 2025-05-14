import { type NextRequest, NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db/neon"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar conexión a la base de datos
    const connectionResult = await checkDatabaseConnection()

    if (connectionResult.connected) {
      return NextResponse.json({ success: true, message: "Conexión a la base de datos establecida correctamente" })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al conectar con la base de datos",
          error: connectionResult.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la conexión a la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
