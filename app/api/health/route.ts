import { NextResponse } from "next/server"
import { checkSystemHealth } from "@/lib/system-check"

export async function GET() {
  try {
    // Verificar si las variables de entorno están definidas
    const shopifyApiUrl = process.env.SHOPIFY_API_URL
    const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN

    // Si faltan variables de entorno, devolver una respuesta con advertencia pero no fallar
    if (!shopifyApiUrl || !shopifyAccessToken) {
      return NextResponse.json(
        {
          status: "warning",
          message: "Faltan variables de entorno para Shopify (SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN)",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          services: {
            shopify: {
              status: "warning",
              message: "Configuración incompleta",
            },
          },
        },
        { status: 200 },
      )
    }

    // Si las variables están presentes, realizar la verificación completa
    const healthStatus = await checkSystemHealth()

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Error en health check:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido en health check",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
