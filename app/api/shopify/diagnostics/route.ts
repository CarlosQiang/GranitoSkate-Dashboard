import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { testShopifyConnection, testCollectionsQuery } from "@/lib/shopify-diagnostics"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Ejecutar diagnósticos
    const connectionTest = await testShopifyConnection()
    const collectionsTest = await testCollectionsQuery()

    return NextResponse.json({
      connection: connectionTest,
      collections: collectionsTest,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en diagnóstico de Shopify:", error)
    return NextResponse.json(
      { error: "Error al realizar diagnóstico", details: (error as Error).message },
      { status: 500 },
    )
  }
}
