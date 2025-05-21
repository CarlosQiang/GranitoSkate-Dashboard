import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"
import { initializeDatabase } from "@/lib/db/init-db"

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
        // Construir la URL completa para la solicitud de productos
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          (process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : "http://localhost:3000")

        const productsUrl = `${apiUrl}/api/shopify/products?limit=1`

        const productsResponse = await fetch(productsUrl, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Accept: "application/json",
          },
        })

        // Verificar si la respuesta es JSON antes de intentar parsearla
        const contentType = productsResponse.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
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
        } else {
          console.warn("La respuesta de productos no es JSON:", contentType)
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

    // Modificar el endpoint de inicialización para incluir la inicialización de las tablas de tema
    const dbSuccess = await initializeDatabase()

    if (dbSuccess) {
      return NextResponse.json({
        success: true,
        message: "Sistema inicializado correctamente",
        details: {
          shopify: {
            connected: true,
            shopName: shopifyStatus.data?.shop?.name || "Tienda Shopify",
          },
          database: {
            initialized: true,
          },
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al inicializar el sistema",
          details: {
            shopify: {
              connected: true,
              shopName: shopifyStatus.data?.shop?.name || "Tienda Shopify",
            },
            database: {
              initialized: false,
            },
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error en la inicialización:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido durante la inicialización",
        error: error instanceof Error ? error.message : "Error desconocido durante la inicialización",
      },
      { status: 500 },
    )
  }
}
