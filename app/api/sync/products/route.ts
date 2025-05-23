import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncProductsToDatabase, getShopifyProducts } from "@/lib/services/shopify-data-service"

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
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const syncMode = url.searchParams.get("mode") || "cache"

    if (syncMode === "cache") {
      // Solo obtener productos y almacenarlos en caché
      const products = await getShopifyProducts(true, limit)

      return NextResponse.json({
        success: true,
        message: `Se obtuvieron ${products.length} productos de Shopify y se almacenaron en caché`,
        count: products.length,
        products: products.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          variants: p.variants.edges.length,
        })),
      })
    } else {
      // Sincronizar productos con la base de datos
      const result = await syncProductsToDatabase(limit)

      return NextResponse.json({
        success: true,
        message: `Sincronización de productos completada: ${result.success} exitosos, ${result.errors} errores`,
        result,
      })
    }
  } catch (error: any) {
    console.error("Error en sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de productos",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
