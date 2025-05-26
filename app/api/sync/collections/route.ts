import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncCollectionsToDatabase, getShopifyCollections } from "@/lib/services/shopify-data-service"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el límite de la URL si existe
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const syncMode = url.searchParams.get("mode") || "cache"

    if (syncMode === "cache") {
      // Solo obtener colecciones y almacenarlas en caché
      const collections = await getShopifyCollections(true, limit)

      return NextResponse.json({
        success: true,
        message: `Se obtuvieron ${collections.length} colecciones de Shopify y se almacenaron en caché`,
        count: collections.length,
        collections: collections.map((c) => ({
          id: c.id,
          title: c.title,
          productsCount: c.productsCount,
        })),
      })
    } else {
      // Sincronizar colecciones con la base de datos
      const result = await syncCollectionsToDatabase(limit)

      return NextResponse.json({
        success: true,
        message: `Sincronización de colecciones completada: ${result.success} exitosas, ${result.errors} errores`,
        result,
      })
    }
  } catch (error: any) {
    console.error("Error en sincronización de colecciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de colecciones",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
