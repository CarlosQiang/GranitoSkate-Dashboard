import { NextResponse } from "next/server"
import { testShopifyConnection } from "@/lib/shopify"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Verificar conexión con Shopify
    const shopifyStatus = await testShopifyConnection()

    // Verificar conexión con la base de datos
    let dbStatus = { success: false, message: "No se pudo verificar la conexión a la base de datos" }

    try {
      // Intentar una consulta simple a la base de datos
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/db/check`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (response.ok) {
        const data = await response.json()
        dbStatus = {
          success: true,
          message: "Conexión a la base de datos establecida correctamente",
        }
      } else {
        dbStatus = {
          success: false,
          message: `Error al conectar con la base de datos: ${response.statusText}`,
        }
      }
    } catch (e) {
      console.error("Error al verificar la base de datos:", e)
      dbStatus = {
        success: false,
        message: `Error al verificar la base de datos: ${e instanceof Error ? e.message : "Error desconocido"}`,
      }
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        shopify: shopifyStatus,
        database: dbStatus,
      },
    })
  } catch (error) {
    console.error("Error en health check:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
