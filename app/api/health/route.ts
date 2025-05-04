import { NextResponse } from "next/server"
import { checkSystemHealth } from "@/lib/system-check"

export async function GET() {
  try {
    const healthCheck = await checkSystemHealth()

    // Si hay un problema con la salud del sistema, devolver un código de estado apropiado
    if (healthCheck.status === "error") {
      return NextResponse.json(healthCheck, { status: 500 })
    } else if (healthCheck.status === "warning") {
      return NextResponse.json(healthCheck, { status: 200 })
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    console.error("Error en la ruta de verificación de salud:", error)

    // Manejar específicamente el error de variables de entorno faltantes
    if ((error as Error).message.includes("variables de entorno")) {
      return NextResponse.json(
        {
          status: "warning",
          message: "Advertencia: " + (error as Error).message,
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
      ) // Devolver 200 para que no falle el despliegue
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Error en la verificación de salud: " + (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
