import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchAnalyticsData() {
  try {
    // Obtener datos de pedidos
    const ordersQuery = gql`
      query {
        orders(first: 250, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    name
                    quantity
                    product {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const ordersData = await shopifyClient.request(ordersQuery)
    const orders = ordersData.orders.edges.map((edge: any) => edge.node)

    // Calcular ingresos totales
    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + Number.parseFloat(order.totalPriceSet.shopMoney.amount),
      0,
    )

    // Calcular valor promedio de pedido
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Agrupar pedidos por mes
    const ordersByMonth = orders.reduce((acc: any, order: any) => {
      const date = new Date(order.createdAt)
      const month = date.toLocaleString("es-ES", { month: "short" })
      const year = date.getFullYear()
      const key = `${month} ${year}`

      if (!acc[key]) {
        acc[key] = {
          orders: 0,
          revenue: 0,
        }
      }

      acc[key].orders += 1
      acc[key].revenue += Number.parseFloat(order.totalPriceSet.shopMoney.amount)

      return acc
    }, {})

    // Convertir a arrays para los gráficos
    const revenueData = Object.keys(ordersByMonth).map((key) => ({
      name: key,
      total: ordersByMonth[key].revenue,
    }))

    const chartOrdersData = Object.keys(ordersByMonth).map((key) => ({
      name: key,
      total: ordersByMonth[key].orders,
    }))

    // Ordenar por fecha
    revenueData.sort((a, b) => {
      const [monthA, yearA] = a.name.split(" ")
      const [monthB, yearB] = b.name.split(" ")
      return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime()
    })

    chartOrdersData.sort((a, b) => {
      const [monthA, yearA] = a.name.split(" ")
      const [monthB, yearB] = b.name.split(" ")
      return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime()
    })

    // Calcular productos más vendidos
    const productSales: Record<string, { name: string; sales: number }> = {}

    orders.forEach((order: any) => {
      order.lineItems.edges.forEach((edge: any) => {
        const { name, quantity, product } = edge.node
        if (product) {
          const productId = product.id
          if (!productSales[productId]) {
            productSales[productId] = {
              name: name,
              sales: 0,
            }
          }
          productSales[productId].sales += quantity
        }
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.sales - a.sales)
      .slice(0, 5)

    return {
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue,
      topProducts,
      revenueData,
      ordersData: chartOrdersData,
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    throw new Error(`Error al obtener datos de análisis: ${(error as Error).message}`)
  }
}
