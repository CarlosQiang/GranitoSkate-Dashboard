import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyCache } from "@/lib/services/cache-service"
import { fetchShopifyProducts } from "@/lib/services/shopify-service"
import { transformShopifyProduct } from "@/lib/services/data-transformer"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // Verificar autenticación
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Obtener parámetros de la URL
  const url = new URL(request.url)
  const forceRefresh = url.searchParams.get("refresh") === "true"
  const limit = Number.parseInt(url.searchParams.get("limit") || "100")
  const transform = url.searchParams.get("transform") !== "false" // Por defecto transformar

  // Obtener productos de Shopify (o de la caché)
  const products = await fetchShopifyProducts(forceRefresh, limit)

  // Transformar productos si se solicita
  const transformedProducts = transform ? products.map(transformShopifyProduct) : products

  return NextResponse.json({
    success: true,
    count: transformedProducts.length,
    fromCache: !forceRefresh && shopifyCache.isProductCacheValid(),
    data: transformedProducts,
  })
}
