import { NextResponse } from "next/server"
import { initializeDatabase, checkConnection } from "@/lib/db/neon"

export async function GET() {
  try {
    // Verificar conexión
    const connectionStatus = await checkConnection()

    if (!connectionStatus.connected) {
      return NextResponse.json(
        {
          status: "error",
          message: "No se pudo conectar a la base de datos",
          details: connectionStatus.error,
        },
        { status: 500 },
      )
    }

    // Inicializar base de datos
    const initResult = await initializeDatabase()

    if (!initResult.initialized) {
      return NextResponse.json(
        {
          status: "error",
          message: "Error al inicializar la base de datos",
          details: initResult.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Base de datos inicializada correctamente",
      adminCreated: initResult.adminCreated,
      connectionStatus,
    })
  } catch (error) {
    console.error("Error en el endpoint de inicialización:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error inesperado",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
