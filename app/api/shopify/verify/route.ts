import { type NextRequest, NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/api/shopify"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar conexión con Shopify
    const response = await shopifyFetch({
      endpoint: "shop.json",
      method: "GET",
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          connected: false,
          error: `Error al conectar con Shopify: ${response.statusText}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      connected: true,
      shop: data.shop,
    })
  } catch (error) {
    console.error("Error al verificar conexión con Shopify:", error)
    return NextResponse.json(
      {
        connected: false,
        error: "Error al verificar conexión con Shopify",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
