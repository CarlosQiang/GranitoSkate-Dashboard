import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"
import { shopifyConfig } from "@/lib/config/shopify"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verificar si la configuración de Shopify es válida
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      const errors = []
      if (!shopifyConfig.shopDomain) errors.push("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está configurado")
      if (!shopifyConfig.accessToken) errors.push("SHOPIFY_ACCESS_TOKEN no está configurado")

      return NextResponse.json({
        success: false,
        message: "Faltan credenciales de Shopify",
        details: errors,
      })
    }

    // Probar la conexión con Shopify
    const result = await testShopifyConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al probar la conexión con Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al probar la conexión con Shopify",
      },
      { status: 500 },
    )
  }
}
