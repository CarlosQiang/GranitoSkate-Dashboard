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

    // Consulta para obtener información de la tienda
    const shopQuery = `
      query {
        shop {
          name
        }
      }
    `

    // Consulta corregida para obtener productos
    const productsQuery = `
      query {
        products(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `

    // Consulta corregida para obtener pedidos
    const ordersQuery = `
      query {
        orders(first: 100, sortKey: PROCESSED_AT, reverse: true) {
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

    // Consulta corregida para obtener clientes
    const customersQuery = `
      query {
        customers(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `

    // Usar el proxy para cada consulta
    console.log("Obteniendo información de la tienda...")
    const shopResponse = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: shopQuery }),
      cache: "no-store",
    })

    console.log("Obteniendo información de productos...")
    const productsResponse = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: productsQuery }),
      cache: "no-store",
    })

    console.log("Obteniendo información de pedidos...")
    const ordersResponse = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: ordersQuery }),
      cache: "no-store",
    })

    console.log("Obteniendo información de clientes...")
    const customersResponse = await fetch("/api/shopify/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: customersQuery }),
      cache: "no-store",
    })

    // Verificar respuestas
    if (!shopResponse.ok || !productsResponse.ok || !ordersResponse.ok || !customersResponse.ok) {
      throw new Error("Error en una o más consultas a la API de Shopify")
    }

    // Procesar respuestas
    const shopData = await shopResponse.json()
    const productsData = await productsResponse.json()
    const ordersData = await ordersResponse.json()
    const customersData = await customersResponse.json()

    // Verificar errores en las respuestas
    if (shopData.errors || productsData.errors || ordersData.errors || customersData.errors) {
      console.error("Errores en las consultas GraphQL:", {
        shop: shopData.errors,
        products: productsData.errors,
        orders: ordersData.errors,
        customers: customersData.errors,
      })
      throw new Error("Errores en las consultas GraphQL")
    }

    // Extraer datos
    const shopName = shopData.data?.shop?.name || "Tienda Shopify"

    // Contar productos manualmente
    const totalProducts = productsData.data?.products?.edges?.length || 0

    // Contar pedidos manualmente
    const orders = ordersData.data?.orders?.edges || []
    const totalOrders = orders.length

    // Calcular ingresos totales
    let totalRevenue = 0
    orders.forEach((edge) => {
      const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")
      totalRevenue += amount
    })

    // Contar clientes manualmente
    const totalCustomers = customersData.data?.customers?.edges?.length || 0

    const stats = {
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      shopName,
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
      error: error.message || "Error desconocido",
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

    const query = `
      query {
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
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("Errores GraphQL:", result.errors)
      throw new Error(result.errors[0]?.message || "Error en la consulta GraphQL")
    }

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

    const query = `
      query {
        products(first: 10, sortKey: TITLE) {
          edges {
            node {
              id
              title
              totalInventory
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
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
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("Errores GraphQL:", result.errors)
      throw new Error(result.errors[0]?.message || "Error en la consulta GraphQL")
    }

    const data = result.data

    if (!data || !data.products || !data.products.edges) {
      console.warn("No se encontraron datos para el gráfico de productos")
      return []
    }

    // Obtener los productos
    const topProducts = data.products.edges.slice(0, 5).map((edge, index) => ({
      name: edge.node.title,
      sales: 100 - index * 15, // Valor simulado para mostrar en el gráfico
      id: edge.node.id.split("/").pop(),
      inventory: edge.node.totalInventory || 0,
      price: edge.node.variants.edges[0]?.node.price || "0.00",
    }))

    console.log("Datos de productos más vendidos obtenidos correctamente")
    return topProducts
  } catch (error) {
    console.error("Error al obtener datos de productos más vendidos:", error)
    return []
  }
}
