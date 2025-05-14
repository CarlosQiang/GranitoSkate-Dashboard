import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Verificar la conexión con Shopify
    const shopifyStatus = await testShopifyConnection()

    if (!shopifyStatus.success) {
      console.error("Error al conectar con Shopify:", shopifyStatus.message)
      return NextResponse.json(
        {
          success: false,
          message: `Error al conectar con Shopify: ${shopifyStatus.message}`,
          details: {
            shopify: {
              connected: false,
              error: shopifyStatus.message,
            },
          },
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Sistema inicializado correctamente",
      details: {
        shopify: {
          connected: true,
          shopName: shopifyStatus.data?.shop?.name || "Tienda Shopify",
        },
      },
    })
  } catch (error) {
    console.error("Error en la inicialización:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido durante la inicialización",
      },
      { status: 500 },
    )
  }
}
