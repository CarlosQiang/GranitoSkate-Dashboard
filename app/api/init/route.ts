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

      // Intentar verificar si realmente podemos acceder a los datos
      // a pesar del error de inicialización
      try {
        // Intentar obtener productos directamente para verificar si realmente hay un problema
        const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/shopify/products?limit=1`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })

        const productsData = await productsResponse.json()

        // Si podemos obtener productos, entonces la conexión realmente funciona
        if (productsData && !productsData.error && productsData.products?.length > 0) {
          return NextResponse.json({
            success: true,
            message: "Sistema funcionando correctamente (ignorando error de inicialización)",
            details: {
              shopify: {
                connected: true,
                warning: shopifyStatus.message,
                actuallyWorks: true,
              },
            },
          })
        }
      } catch (e) {
        console.error("Error al verificar productos:", e)
      }

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
