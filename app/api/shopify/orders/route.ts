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

    const url = new URL(req.url)
    const limit = url.searchParams.get("limit") || "50"
    const page = url.searchParams.get("page") || "1"
    const status = url.searchParams.get("status") || "any"

    const response = await shopifyFetch({
      endpoint: `orders.json?limit=${limit}&page=${page}&status=${status}`,
      method: "GET",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error al obtener pedidos: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en API de pedidos:", error)
    return NextResponse.json(
      {
        error: "Error al obtener pedidos",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
