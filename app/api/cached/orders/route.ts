import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchShopifyOrders } from "@/lib/services/shopify-service"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const url = new URL(request.url)
    const forceRefresh = url.searchParams.get("refresh") === "true"
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    // Obtener pedidos de Shopify (o de la caché)
    const orders = await fetchShopifyOrders(forceRefresh, limit)

    return NextResponse.json({
      success: true,
      count: orders.length,
      fromCache: !forceRefresh,
      data: orders,
    })
  } catch (error: any) {
    console.error("Error al obtener pedidos en caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener pedidos",
      },
      { status: 500 },
    )
  }
}
