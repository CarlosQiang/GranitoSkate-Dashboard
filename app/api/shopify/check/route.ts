import { NextResponse } from "next/server"
import { checkShopifyConnection } from "@/lib/shopify"

export async function GET() {
  try {
    const result = await checkShopifyConnection()

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
