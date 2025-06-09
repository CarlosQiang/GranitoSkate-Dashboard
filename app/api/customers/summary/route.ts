import { NextResponse } from "next/server"
import { fetchCustomers } from "@/lib/api/customers"

export async function GET() {
  try {
    console.log("👥 Loading customers summary...")

    // Obtener clientes de Shopify
    const customersData = await fetchCustomers({ first: 100 })
    const customers = customersData.customers

    // Calcular estadísticas
    const stats = {
      totalCustomers: customers.length,
      verifiedEmails: customers.filter((customer) => customer.verifiedEmail).length,
      totalSpent: customers
        .reduce((sum, customer) => {
          return sum + Number.parseFloat(customer.totalSpent?.amount || "0")
        }, 0)
        .toFixed(2),
      averageOrders:
        customers.length > 0
          ? (customers.reduce((sum, customer) => sum + (customer.ordersCount || 0), 0) / customers.length).toFixed(1)
          : "0",
      currency: customers[0]?.totalSpent?.currencyCode || "EUR",
    }

    // Agrupar por número de pedidos
    const byOrderCount = customers.reduce(
      (acc, customer) => {
        const orders = customer.ordersCount || 0
        let category = "Sin pedidos"
        if (orders > 0 && orders <= 1) category = "1 pedido"
        else if (orders > 1 && orders <= 5) category = "2-5 pedidos"
        else if (orders > 5) category = "5+ pedidos"

        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Clientes más valiosos (top 10)
    const topCustomers = customers
      .sort((a, b) => Number.parseFloat(b.totalSpent?.amount || "0") - Number.parseFloat(a.totalSpent?.amount || "0"))
      .slice(0, 10)

    // Clientes recientes (últimos 10)
    const recentCustomers = customers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    console.log(`✅ Customers summary loaded: ${customers.length} customers, €${stats.totalSpent} total spent`)

    return NextResponse.json({
      success: true,
      data: {
        stats,
        customers,
        topCustomers,
        recentCustomers,
        byOrderCount,
        pageInfo: customersData.pageInfo,
      },
    })
  } catch (error) {
    console.error("❌ Error loading customers summary:", error)

    // Devolver datos de fallback en caso de error
    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        stats: {
          totalCustomers: 0,
          verifiedEmails: 0,
          totalSpent: "0.00",
          averageOrders: "0",
          currency: "EUR",
        },
        customers: [],
        topCustomers: [],
        recentCustomers: [],
        byOrderCount: {},
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    })
  }
}
