import { NextResponse } from "next/server"
import { getCacheStats } from "@/lib/services/shopify-service"
import { shopifyCache } from "@/lib/services/cache-service"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Obtener estadísticas de la caché
    const stats = getCacheStats()
    const cacheStats = shopifyCache.getCacheStats()

    // Combinar estadísticas
    const combinedStats = {
      productos: {
        count: Math.max(stats.productos.cantidad, cacheStats.products.count),
        lastUpdated: stats.productos.ultimaActualizacion,
        isValid: stats.productos.valido,
      },
      colecciones: {
        count: Math.max(stats.colecciones.cantidad, cacheStats.collections.count),
        lastUpdated: stats.colecciones.ultimaActualizacion,
        isValid: stats.colecciones.valido,
      },
      clientes: {
        count: Math.max(stats.clientes.cantidad, cacheStats.customers.count),
        lastUpdated: stats.clientes.ultimaActualizacion,
        isValid: stats.clientes.valido,
      },
      pedidos: {
        count: Math.max(stats.pedidos.cantidad, cacheStats.orders.count),
        lastUpdated: stats.pedidos.ultimaActualizacion,
        isValid: stats.pedidos.valido,
      },
    }

    return NextResponse.json({
      success: true,
      data: combinedStats,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas de caché:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas de caché",
      },
      { status: 500 },
    )
  }
}
