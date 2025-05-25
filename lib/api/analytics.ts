import { shopifyFetch } from "@/lib/shopify"
import { fetchRecentOrders } from "./orders"
import { fetchProducts } from "./products"

export async function fetchAnalyticsData() {
  try {
    // Obtener datos básicos
    const [orders, products] = await Promise.all([fetchRecentOrders(100), fetchProducts(50)])

    // Calcular métricas
    const totalRevenue = orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice || "0"), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Datos de ingresos por mes (simulados)
    const revenueData = [
      { month: "Ene", total: totalRevenue * 0.8 },
      { month: "Feb", total: totalRevenue * 0.9 },
      { month: "Mar", total: totalRevenue },
    ]

    // Datos de pedidos por mes (simulados)
    const ordersData = [
      { month: "Ene", total: Math.floor(totalOrders * 0.8) },
      { month: "Feb", total: Math.floor(totalOrders * 0.9) },
      { month: "Mar", total: totalOrders },
    ]

    // Productos más vendidos (simulados)
    const topProducts = products.slice(0, 5).map((product, index) => ({
      name: product.title,
      sales: Math.floor(Math.random() * 50) + 10,
    }))

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueData,
      ordersData,
      topProducts,
    }
  } catch (error) {
    console.error("Error al obtener datos de analíticas:", error)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      revenueData: [],
      ordersData: [],
      topProducts: [],
    }
  }
}

export async function fetchSalesOverview(period = "7d") {
  try {
    // Calcular fechas basadas en el período
    const endDate = new Date()
    const startDate = new Date()

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    // Formatear fechas para la consulta GraphQL
    const formattedStartDate = startDate.toISOString().split("T")[0]
    const formattedEndDate = endDate.toISOString().split("T")[0]

    const query = `
      query {
        orders(first: 250, query: "created_at:>=${formattedStartDate} AND created_at:<=${formattedEndDate}") {
          edges {
            node {
              id
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener los datos de ventas")
    }

    // Procesar los datos para el gráfico
    const orders = response.data.orders.edges.map(({ node }) => ({
      id: node.id.split("/").pop(),
      date: new Date(node.createdAt).toISOString().split("T")[0],
      amount: Number.parseFloat(node.totalPriceSet?.shopMoney?.amount || 0),
    }))

    // Agrupar ventas por fecha
    const salesByDate = orders.reduce((acc, order) => {
      if (!acc[order.date]) {
        acc[order.date] = 0
      }
      acc[order.date] += order.amount
      return acc
    }, {})

    // Generar array de fechas entre startDate y endDate
    const dateArray = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0]
      dateArray.push({
        date: dateString,
        sales: salesByDate[dateString] || 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dateArray
  } catch (error) {
    console.error("Error al obtener datos de ventas:", error)

    // Datos de fallback para evitar errores en la UI
    const fallbackData = []
    const endDate = new Date()
    const startDate = new Date()

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0]
      fallbackData.push({
        date: dateString,
        sales: 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return fallbackData
  }
}
