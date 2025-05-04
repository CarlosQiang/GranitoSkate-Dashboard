import { NextResponse } from "next/server"
import { performSystemCheck } from "@/lib/system-check"

export async function GET() {
  try {
    // Realizar verificación del sistema
    const systemStatus = await performSystemCheck()

    if (systemStatus.success) {
      return NextResponse.json({
        status: "ok",
        message: "El sistema está funcionando correctamente",
        shopify: {
          connected: true,
          shopName: systemStatus.shopName,
          counts: systemStatus.counts,
        },
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "El sistema tiene problemas",
          error: systemStatus.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error al verificar el estado del sistema",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
