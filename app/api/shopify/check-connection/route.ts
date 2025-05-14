import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"

export async function GET() {
  try {
    // Verificar si las variables de entorno están configuradas
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) {
      return NextResponse.json({
        success: false,
        message: "NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado",
      })
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        message: "SHOPIFY_ACCESS_TOKEN no está configurado",
      })
    }

    // Probar la conexión con Shopify
    const result = await testShopifyConnection(true)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al verificar la conexión con Shopify:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
