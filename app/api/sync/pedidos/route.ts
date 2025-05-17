import { NextResponse } from "next/server"
import { obtenerPedidosDeShopify } from "@/lib/services/sync-service"

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Obtener pedidos reales de Shopify
    const pedidos = await obtenerPedidosDeShopify(limit)

    return NextResponse.json({
      success: true,
      message: `Se obtuvieron ${pedidos.length} pedidos de Shopify`,
      data: pedidos,
    })
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
