import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyCache } from "@/lib/services/cache-service"
import { fetchShopifyCollections } from "@/lib/services/shopify-service"
import { transformShopifyCollection } from "@/lib/services/data-transformer"

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
    const transform = url.searchParams.get("transform") !== "false" // Por defecto transformar

    // Obtener colecciones de Shopify (o de la caché)
    const collections = await fetchShopifyCollections(forceRefresh, limit)

    // Transformar colecciones si se solicita
    const transformedCollections = transform
      ? collections.map((collection) => transformShopifyCollection(collection))
      : collections

    return NextResponse.json({
      success: true,
      count: transformedCollections.length,
      fromCache: !forceRefresh && shopifyCache.isCollectionCacheValid(),
      data: transformedCollections,
    })
  } catch (error: any) {
    console.error("Error al obtener colecciones en caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener colecciones",
      },
      { status: 500 },
    )
  }
}
