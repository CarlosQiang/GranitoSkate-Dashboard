import { type NextRequest, NextResponse } from "next/server"
import { verifyShopifyConnection } from "@/lib/api/utils"
import { checkDatabaseConnection } from "@/lib/db/neon"

export async function GET(req: NextRequest) {
  try {
    // Verificar conexión con Shopify
    const shopifyStatus = await verifyShopifyConnection()

    // Verificar conexión con la base de datos
    const dbStatus = await checkDatabaseConnection()

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
