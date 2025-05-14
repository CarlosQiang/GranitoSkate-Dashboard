import { type NextRequest, NextResponse } from "next/server"
import { verifyShopifyConnection } from "@/lib/api/utils"
import { checkDatabaseConnection } from "@/lib/db/neon"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)

    // Verificar conexión con Shopify
    const shopifyStatus = await verifyShopifyConnection()

    // Verificar conexión con la base de datos
    const dbStatus = await checkDatabaseConnection()

    return NextResponse.json({
      initialized: true,
      authenticated: !!session,
      services: {
        shopify: shopifyStatus,
        database: dbStatus,
      },
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en inicialización:", error)
    return NextResponse.json(
      {
        initialized: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
