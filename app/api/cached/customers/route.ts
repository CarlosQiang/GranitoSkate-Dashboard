import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchShopifyCustomers } from "@/lib/services/shopify-service"

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

    // Obtener clientes de Shopify (o de la caché)
    const customers = await fetchShopifyCustomers(forceRefresh, limit)

    return NextResponse.json({
      success: true,
      count: customers.length,
      fromCache: !forceRefresh,
      data: customers,
    })
  } catch (error: any) {
    console.error("Error al obtener clientes en caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener clientes",
      },
      { status: 500 },
    )
  }
}
