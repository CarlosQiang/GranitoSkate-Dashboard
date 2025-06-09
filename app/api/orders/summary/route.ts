import { NextResponse } from "next/server"
import { fetchRecentOrders } from "@/lib/api/orders"

export async function GET() {
  try {
    console.log("📦 Loading orders summary...")

    // Obtener pedidos de Shopify
    const orders = await fetchRecentOrders(50) // Aumentamos el límite

    // Calcular estadísticas
    const stats = {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice || "0"), 0).toFixed(2),
      pendingOrders: orders.filter((order) => order.financialStatus === "PENDING").length,
      fulfilledOrders: orders.filter((order) => order.fulfillmentStatus === "FULFILLED").length,
      currency: orders[0]?.currencyCode || "EUR",
    }

    // Agrupar por estado financiero
    const byFinancialStatus = orders.reduce(
      (acc, order) => {
        const status = order.financialStatus || "UNKNOWN"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Agrupar por estado de cumplimiento
    const byFulfillmentStatus = orders.reduce(
      (acc, order) => {
        const status = order.fulfillmentStatus || "UNKNOWN"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Pedidos recientes (últimos 10)
    const recentOrders = orders.slice(0, 10)

    console.log(`✅ Orders summary loaded: ${orders.length} orders, €${stats.totalValue} total`)

    return NextResponse.json({
      success: true,
      data: {
        stats,
        orders,
        recentOrders,
        byFinancialStatus,
        byFulfillmentStatus,
      },
    })
  } catch (error) {
    console.error("❌ Error loading orders summary:", error)

    // Devolver datos de fallback en caso de error
    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        stats: {
          totalOrders: 0,
          totalValue: "0.00",
          pendingOrders: 0,
          fulfilledOrders: 0,
          currency: "EUR",
        },
        orders: [],
        recentOrders: [],
        byFinancialStatus: {},
        byFulfillmentStatus: {},
      },
    })
  }
}
