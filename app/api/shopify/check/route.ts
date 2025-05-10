import { NextResponse } from "next/server"
import { checkShopifyConnection } from "@/lib/shopify"

export async function GET() {
  try {
    const result = await checkShopifyConnection()

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 200 }) // Cambiado a 200 para evitar errores en el cliente
    }
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        usingMockData: true,
      },
      { status: 200 }, // Cambiado a 200 para evitar errores en el cliente
    )
  }
}
