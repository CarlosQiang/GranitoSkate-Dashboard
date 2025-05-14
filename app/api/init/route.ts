import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Verificar la conexión con Shopify usando un método alternativo
    // que sea más tolerante con diferentes configuraciones
    const shopifyStatus = await testShopifyConnection(true)

    if (!shopifyStatus.success) {
      console.warn("Advertencia al conectar con Shopify:", shopifyStatus.message)

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
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sistema inicializado correctamente",
        details: {
          shopify: {
            connected: true,
            shopName: shopifyStatus.data?.shop?.name || "Tienda Shopify",
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error en la inicialización:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido durante la inicialización",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
