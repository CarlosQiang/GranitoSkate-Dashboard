import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchAnalyticsData() {
  try {
    // Consulta para obtener datos de ventas
    const revenueQuery = gql`
      query {
        orders(first: 50, query: "status:any") {
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
              lineItems(first: 5) {
                edges {
                  node {
                    name
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(revenueQuery)
    const orders = data.orders.edges.map((edge) => edge.node)

    // Procesar datos para análisis
    const totalRevenue = orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPriceSet.shopMoney.amount), 0)

    const totalOrders = orders.length

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Agrupar pedidos por mes para gráfico de ingresos
    const revenueByMonth = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          total: 0,
        }
      }

      acc[monthYear].total += Number.parseFloat(order.totalPriceSet.shopMoney.amount)
      return acc
    }, {})

    const revenueData = Object.values(revenueByMonth)

    // Calcular productos más vendidos
    const productSales = {}
    orders.forEach((order) => {
      order.lineItems.edges.forEach((edge) => {
        const product = edge.node
        if (!productSales[product.name]) {
          productSales[product.name] = 0
        }
        productSales[product.name] += product.quantity
      })
    })

    const topProducts = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    // Agrupar pedidos por mes para gráfico de pedidos
    const ordersByMonth = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          total: 0,
        }
      }

      acc[monthYear].total += 1
      return acc
    }, {})

    const ordersData = Object.values(ordersByMonth)

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      revenueData,
      ordersData,
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    throw new Error(`Error al obtener datos de análisis: ${error.message}`)
  }
}

export async function fetchSalesOverview() {
  try {
    // En lugar de usar una consulta con variable $date que causa problemas,
    // usamos una consulta sin variables
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const dateString = thirtyDaysAgo.toISOString().split("T")[0]

    const query = gql`
      query {
        orders(first: 250, query: "created_at:>=${dateString} status:any") {
          edges {
            node {
              id
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Agrupar ventas por día
    const salesByDay = {}

    data.orders.edges.forEach(({ node }) => {
      const date = new Date(node.createdAt)
      const dateString = date.toISOString().split("T")[0] // YYYY-MM-DD

      if (!salesByDay[dateString]) {
        salesByDay[dateString] = {
          date: dateString,
          amount: 0,
        }
      }

      salesByDay[dateString].amount += Number.parseFloat(node.totalPriceSet.shopMoney.amount)
    })

    // Asegurarse de que todos los días estén representados
    const result = []
    const currentDate = new Date(thirtyDaysAgo)
    const today = new Date()

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split("T")[0]

      result.push({
        date: dateString,
        amount: salesByDay[dateString] ? Math.round(salesByDay[dateString].amount * 100) / 100 : 0,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return result
  } catch (error) {
    console.error("Error fetching sales overview:", error)
    throw new Error(`Error al obtener visión general de ventas: ${error.message}`)
  }
}
