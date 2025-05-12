import { shopifyFetch } from "@/lib/shopify"

export async function fetchAnalyticsData() {
  try {
    // Consulta para obtener datos de ventas
    const query = `
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

    const response = await shopifyFetch({ query })

    if (!response.data) {
      throw new Error("No se pudieron obtener los datos de análisis")
    }

    const orders = response.data.orders.edges.map(({ node }) => node)

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
