import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchDashboardStats() {
  try {
    // Consulta para obtener estadísticas básicas de la tienda
    const query = gql`
      query {
        shop {
          name
          currencyCode
        }
        products(first: 250) {
          edges {
            node {
              id
            }
          }
        }
        customers(first: 250) {
          edges {
            node {
              id
            }
          }
        }
        orders(first: 250) {
          edges {
            node {
              id
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

    const data = await shopifyClient.request(query)

    // Calcular estadísticas
    const totalProducts = data?.products?.edges?.length || 0
    const totalCustomers = data?.customers?.edges?.length || 0
    const totalOrders = data?.orders?.edges?.length || 0

    // Calcular ingresos totales
    let totalSales = 0
    let currency = "EUR"

    if (data?.orders?.edges) {
      data.orders.edges.forEach((edge) => {
        const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")
        currency = edge.node.totalPriceSet?.shopMoney?.currencyCode || currency
        totalSales += amount
      })
    }

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      totalProducts,
      totalCustomers,
      currency,
      shopName: data?.shop?.name || "",
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
