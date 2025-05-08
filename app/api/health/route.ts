import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulamos un estado de salud del sistema
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: { status: "ok", message: "Conexión simulada correcta" },
        shopify: { status: "ok", message: "Conexión simulada correcta" },
        auth: { status: "ok", message: "Sistema de autenticación funcionando" },
      },
      environment: process.env.NODE_ENV || "development",
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Error checking health:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido al verificar la salud del sistema",
      },
      { status: 500 },
    )
  }
}
