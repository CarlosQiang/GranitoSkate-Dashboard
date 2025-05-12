import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchDashboardStats() {
  try {
    // Consulta para obtener estadísticas generales de la tienda
    const query = gql`
      query {
        shop {
          name
          currencyCode
          orders(first: 1) {
            edges {
              node {
                id
              }
            }
            totalCount
          }
          products(first: 1) {
            edges {
              node {
                id
              }
            }
            totalCount
          }
          customers(first: 1) {
            edges {
              node {
                id
              }
            }
            totalCount
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    // Consulta para obtener el total de ventas
    const salesQuery = gql`
      query {
        orders(first: 250) {
          edges {
            node {
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

    const salesData = await shopifyClient.request(salesQuery)

    // Calcular el total de ventas
    let totalSales = 0
    if (salesData.orders && salesData.orders.edges) {
      totalSales = salesData.orders.edges.reduce((total, edge) => {
        const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || 0)
        return total + amount
      }, 0)
    }

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders: data.shop.orders.totalCount || 0,
      totalProducts: data.shop.products.totalCount || 0,
      totalCustomers: data.shop.customers.totalCount || 0,
      currency: data.shop.currencyCode || "EUR",
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw new Error(`Error al cargar estadísticas del dashboard: ${error.message}`)
  }
}

export async function fetchSalesData(period = "month") {
  try {
    // Determinar el rango de fechas según el período
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1) // Por defecto, último mes
    }

    const formattedStartDate = startDate.toISOString()
    const formattedEndDate = now.toISOString()

    // Consulta para obtener pedidos en el rango de fechas
    const query = gql`
      query GetSalesData($startDate: DateTime!, $endDate: DateTime!) {
        orders(
          first: 250,
          query: "created_at:>=${startDate} created_at:<=${endDate}",
          sortKey: PROCESSED_AT
        ) {
          edges {
            node {
              id
              processedAt
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

    const data = await shopifyClient.request(query, {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    })

    // Procesar los datos para el gráfico
    const salesByDate = {}
    let currency = "EUR"

    if (data.orders && data.orders.edges) {
      data.orders.edges.forEach((edge) => {
        const date = new Date(edge.node.processedAt).toLocaleDateString()
        const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || 0)
        currency = edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR"

        if (!salesByDate[date]) {
          salesByDate[date] = 0
        }
        salesByDate[date] += amount
      })
    }

    // Convertir a formato para gráfico
    const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
      date,
      amount: Number(amount).toFixed(2),
    }))

    // Ordenar por fecha
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      data: chartData,
      currency,
    }
  } catch (error) {
    console.error("Error fetching sales data:", error)
    throw new Error(`Error al cargar datos de ventas: ${error.message}`)
  }
}

export async function fetchTopProducts(limit = 5) {
  try {
    // Consulta para obtener productos más vendidos
    const query = gql`
      query {
        products(first: ${limit}, sortKey: BEST_SELLING) {
          edges {
            node {
              id
              title
              handle
              totalInventory
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                    compareAtPrice
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.products || !data.products.edges) {
      return []
    }

    return data.products.edges.map((edge) => {
      const node = edge.node
      const variant = node.variants.edges[0]?.node || {}

      return {
        id: node.id.split("/").pop(),
        title: node.title,
        handle: node.handle,
        totalInventory: node.totalInventory,
        image: node.featuredImage?.url || null,
        price: variant.price || "0.00",
        compareAtPrice: variant.compareAtPrice || null,
      }
    })
  } catch (error) {
    console.error("Error fetching top products:", error)
    throw new Error(`Error al cargar productos más vendidos: ${error.message}`)
  }
}

export async function fetchTopCustomers(limit = 5) {
  try {
    // Consulta para obtener clientes con más pedidos
    const query = gql`
      query {
        customers(first: ${limit}, sortKey: ORDERS_COUNT, reverse: true) {
          edges {
            node {
              id
              firstName
              lastName
              email
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (!data || !data.customers || !data.customers.edges) {
      return []
    }

    return data.customers.edges.map((edge) => {
      const node = edge.node

      return {
        id: node.id.split("/").pop(),
        firstName: node.firstName || "",
        lastName: node.lastName || "",
        email: node.email || "",
        ordersCount: node.numberOfOrders || 0,
        totalSpent: {
          amount: node.amountSpent?.amount || "0.00",
          currencyCode: node.amountSpent?.currencyCode || "EUR",
        },
      }
    })
  } catch (error) {
    console.error("Error fetching top customers:", error)
    throw new Error(`Error al cargar clientes principales: ${error.message}`)
  }
}
