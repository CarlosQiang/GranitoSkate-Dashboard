import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener estadísticas de la base de datos
    const productCountResult = await db.query("SELECT COUNT(*) FROM productos")
    const productCount = Number.parseInt(productCountResult.rows[0].count) || 0

    const collectionCountResult = await db.query("SELECT COUNT(*) FROM colecciones")
    const collectionCount = Number.parseInt(collectionCountResult.rows[0].count) || 0

    // Si no hay datos en la base de datos, intentar obtener de la caché
    let totalProducts = productCount
    let totalCollections = collectionCount

    if (totalProducts === 0) {
      try {
        const cacheResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/cached/stats`)
        if (cacheResponse.ok) {
          const cacheData = await cacheResponse.json()
          if (cacheData.success) {
            totalProducts = cacheData.data.productos?.count || 0
            totalCollections = cacheData.data.colecciones?.count || 0
          }
        }
      } catch (error) {
        console.error("Error al obtener estadísticas de caché:", error)
      }
    }

    // Devolver las estadísticas
    return NextResponse.json({
      success: true,
      data: {
        totalSales: 0, // No tenemos datos reales de ventas
        totalOrders: 0, // No tenemos datos reales de pedidos
        totalCustomers: 0, // No tenemos datos reales de clientes
        totalProducts,
        totalCollections,
        salesChange: 0,
        ordersChange: 0,
        customersChange: 0,
        productsChange: 0,
        currency: "EUR",
      },
    })
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al obtener estadísticas del dashboard",
      },
      { status: 500 },
    )
  }
}
