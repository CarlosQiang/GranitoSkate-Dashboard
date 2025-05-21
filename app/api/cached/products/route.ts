import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchShopifyProducts } from "@/lib/services/shopify-service"

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
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")

    // Obtener productos de Shopify (o de la caché)
    const products = await fetchShopifyProducts(forceRefresh, limit)

    return NextResponse.json({
      success: true,
      count: products.length,
      fromCache: !forceRefresh,
      data: products,
    })
  } catch (error: any) {
    console.error("Error al obtener productos en caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener productos",
      },
      { status: 500 },
    )
  }
}
