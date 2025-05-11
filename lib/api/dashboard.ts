import { gql } from "graphql-request"

// Caché para mejorar rendimiento
let statsCache = null
let lastStatsUpdate = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene estadísticas generales para el dashboard
 * @returns Estadísticas de la tienda
 */
export async function fetchDashboardStats() {
  try {
    // Usar caché si existe y tiene menos de 5 minutos
    const now = new Date()
    if (statsCache && lastStatsUpdate && now.getTime() - lastStatsUpdate.getTime() < CACHE_DURATION) {
      console.log("Usando caché de estadísticas")
      return statsCache
    }

    console.log("Obteniendo estadísticas del dashboard...")

    // Consulta para obtener estadísticas generales
    const query = gql`
      query {
        shop {
          name
          ordersCount
          customersCount
          productsCount
        }
        orders(first: 100, sortKey: PROCESSED_AT, reverse: true) {
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

    // Usar el proxy en lugar de shopifyClient directamente
    const response = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    const data = result.data

    if (!data || !data.shop) {
      console.warn("No se pudieron obtener estadísticas de la tienda")
      return {
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalRevenue: 0,
      }
    }

    // Calcular ingresos totales
    let totalRevenue = 0
    if (data.orders && data.orders.edges) {
      totalRevenue = data.orders.edges.reduce((sum, edge) => {
        const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")
        return sum + amount
      }, 0)
    }

    const stats = {
      totalOrders: data.shop.ordersCount || 0,
      totalCustomers: data.shop.customersCount || 0,
      totalProducts: data.shop.productsCount || 0,
      totalRevenue: totalRevenue,
    }

    // Actualizar caché
    statsCache = stats
    lastStatsUpdate = new Date()

    console.log("Estadísticas obtenidas correctamente:", stats)
    return stats
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error)
    return {
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalRevenue: 0,
      error: (error as Error).message,
    }
  }
}

/**
 * Obtiene datos para gráficos de ventas
 * @returns Datos de ventas por mes
 */
export async function fetchSalesChartData() {
  try {
    console.log("Obteniendo datos para gráficos de ventas...")

    // Obtener pedidos de los últimos 6 meses
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sixMonthsAgoISO = sixMonthsAgo.toISOString()

    const query = gql`
      query GetOrdersForChart($date: DateTime!) {
        orders(first: 250, query: "created_at:>=${sixMonthsAgoISO}", sortKey: PROCESSED_AT) {
          edges {
            node {
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

    // Usar el proxy en lugar de shopifyClient directamente
    const response = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { date: sixMonthsAgoISO },
      }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    const data = result.data

    if (!data || !data.orders || !data.orders.edges) {
      console.warn("No se encontraron datos para el gráfico de ventas")
      return []
    }

    // Agrupar ventas por mes
    const salesByMonth = {}
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    data.orders.edges.forEach((edge) => {
      const date = new Date(edge.node.processedAt)
      const monthIndex = date.getMonth()
      const monthName = months[monthIndex]
      const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")

      if (!salesByMonth[monthName]) {
        salesByMonth[monthName] = 0
      }
      salesByMonth[monthName] += amount
    })

    // Convertir a formato para gráfico
    const chartData = Object.keys(salesByMonth).map((month) => ({
      name: month,
      total: Math.round(salesByMonth[month] * 100) / 100, // Redondear a 2 decimales
    }))

    // Ordenar por mes
    const monthOrder = {}
    months.forEach((month, index) => {
      monthOrder[month] = index
    })

    chartData.sort((a, b) => monthOrder[a.name] - monthOrder[b.name])

    console.log("Datos para gráfico de ventas obtenidos correctamente")
    return chartData
  } catch (error) {
    console.error("Error al obtener datos para gráfico de ventas:", error)
    return []
  }
}

/**
 * Obtiene datos para gráficos de productos más vendidos
 * @returns Datos de productos más vendidos
 */
export async function fetchTopProductsChartData() {
  try {
    console.log("Obteniendo datos de productos más vendidos...")

    const query = gql`
      query {
        products(first: 250, sortKey: BEST_SELLING) {
          edges {
            node {
              id
              title
              totalInventory
              totalVariants
              productType
              vendor
            }
          }
        }
      }
    `

    // Usar el proxy en lugar de shopifyClient directamente
    const response = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    const data = result.data

    if (!data || !data.products || !data.products.edges) {
      console.warn("No se encontraron datos para el gráfico de productos")
      return []
    }

    // Obtener los 5 productos más vendidos
    const topProducts = data.products.edges.slice(0, 5).map((edge) => ({
      name: edge.node.title,
      sales: Math.floor(Math.random() * 100) + 20, // Esto es temporal hasta que tengamos datos reales
      id: edge.node.id.split("/").pop(),
      inventory: edge.node.totalInventory || 0,
      variants: edge.node.totalVariants || 0,
      type: edge.node.productType || "",
      vendor: edge.node.vendor || "",
    }))

    console.log("Datos de productos más vendidos obtenidos correctamente")
    return topProducts
  } catch (error) {
    console.error("Error al obtener datos de productos más vendidos:", error)
    return []
  }
}
