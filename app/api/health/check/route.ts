import { NextResponse } from "next/server"
import { verificarBaseDatos, verificarShopify, verificarAuth } from "@/scripts/verificar-despliegue"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🚀 Iniciando verificación de salud del sistema...")

    const checks = {
      database: await verificarBaseDatos(),
      shopify: await verificarShopify(),
      auth: await verificarAuth(),
      timestamp: new Date().toISOString(),
    }

    const allHealthy = Object.values(checks).every((check) => (typeof check === "boolean" ? check : true))

    const status = allHealthy ? "healthy" : "unhealthy"
    const statusCode = allHealthy ? 200 : 503

    console.log(`${allHealthy ? "✅" : "❌"} Estado del sistema: ${status}`)

    return NextResponse.json(
      {
        status,
        checks,
        message: allHealthy ? "Todos los sistemas funcionando correctamente" : "Algunos sistemas requieren atención",
      },
      { status: statusCode },
    )
  } catch (error) {
    console.error("❌ Error en verificación de salud:", error)

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
