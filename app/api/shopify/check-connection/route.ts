import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"

export async function GET() {
  try {
    const result = await testShopifyConnection()

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al verificar la conexión con Shopify",
    })
  }
}
