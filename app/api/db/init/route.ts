import { NextResponse } from "next/server"
import { initTables, checkConnection } from "@/lib/db"

export async function GET() {
  try {
    // Verificar la conexión a la base de datos
    const connectionStatus = await checkConnection()

    if (!connectionStatus.connected) {
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo conectar a la base de datos",
          error: connectionStatus.error,
        },
        { status: 500 },
      )
    }

    // Inicializar las tablas
    const initResult = await initTables()

    if (!initResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Error al inicializar las tablas",
          error: initResult.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Base de datos inicializada correctamente",
      connectionStatus,
      initResult,
    })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al inicializar la base de datos",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
