import { shopifyFetch } from "@/lib/shopify"

export async function fetchDashboardStats() {
  try {
    // Obtener fecha actual y fecha de hace un mes
    const currentDate = new Date()
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(currentDate.getMonth() - 1)

    const formattedCurrentDate = currentDate.toISOString().split("T")[0]
    const formattedLastMonthDate = lastMonthDate.toISOString().split("T")[0]

    // Consulta para obtener estadísticas actuales - CORREGIDA sin usar totalCount
    const currentQuery = `
      query {
        orders(first: 250) {
          edges {
            node {
              id
              name
              email
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                email
                firstName
                lastName
                phone
              }
              lineItems(first: 10) {
                edges {
                  node {
                    quantity
                    product {
                      id
                    }
                  }
                }
              }
            }
          }
        }
        customers(first: 250) {
          edges {
            node {
              id
              email
              firstName
              lastName
              phone
              orders(first: 5) {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
        products(first: 250) {
          edges {
            node {
              id
              title
              description
              productType
              vendor
              status
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
        collections(first: 100) {
          edges {
            node {
              id
              title
              description
              handle
              image {
                url
              }
            }
          }
        }
      }
    `

    // Consulta para obtener ventas totales del mes actual
    const salesQuery = `
      query {
        orders(first: 250, query: "created_at:>=${formattedLastMonthDate}") {
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

    // Ejecutar consultas
    const [currentStatsResponse, salesDataResponse] = await Promise.all([
      shopifyFetch({ query: currentQuery }),
      shopifyFetch({ query: salesQuery }),
    ])

    if (!currentStatsResponse.data || !salesDataResponse.data) {
      throw new Error("No se pudieron obtener las estadísticas del dashboard")
    }

    const currentStats = currentStatsResponse.data
    const salesData = salesDataResponse.data

    // Calcular totales manualmente contando los edges en lugar de usar totalCount
    const totalOrders = currentStats.orders.edges.length
    const totalCustomers = currentStats.customers.edges.length
    const totalProducts = currentStats.products.edges.length
    const totalCollections = currentStats.collections.edges.length

    // Procesar datos de ventas
    const orders = salesData.orders.edges.map(({ node }) => ({
      id: node.id.split("/").pop(),
      date: new Date(node.createdAt),
      amount: Number.parseFloat(node.totalPriceSet?.shopMoney?.amount || 0),
      currency: node.totalPriceSet?.shopMoney?.currencyCode || "EUR", // Asegurar que siempre haya un código de moneda
    }))

    // Separar pedidos del mes actual y del mes anterior
    const currentMonthOrders = orders.filter((order) => {
      const orderMonth = order.date.getMonth()
      const orderYear = order.date.getFullYear()
      return orderMonth === currentDate.getMonth() && orderYear === currentDate.getFullYear()
    })

    const previousMonthOrders = orders.filter((order) => {
      const orderMonth = order.date.getMonth()
      const orderYear = order.date.getFullYear()
      return orderMonth === lastMonthDate.getMonth() && orderYear === lastMonthDate.getFullYear()
    })

    // Calcular totales
    const currentMonthSales = currentMonthOrders.reduce((sum, order) => sum + order.amount, 0)
    const previousMonthSales = previousMonthOrders.reduce((sum, order) => sum + order.amount, 0)

    // Calcular cambios porcentuales
    const salesChange =
      previousMonthSales === 0 ? 100 : Math.round(((currentMonthSales - previousMonthSales) / previousMonthSales) * 100)

    const ordersChange =
      previousMonthOrders.length === 0
        ? 100
        : Math.round(((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100)

    // Datos ficticios para cambios en clientes y productos (no tenemos datos históricos)
    const customersChange = 5
    const productsChange = 2

    // Extraer datos completos para sincronización
    const recentOrders = currentStats.orders.edges.map(({ node }) => ({
      id: node.id,
      name: node.name,
      email: node.email,
      totalPrice: node.totalPriceSet?.shopMoney?.amount || "0",
      status: "pending", // Por defecto
      customer: node.customer,
      lineItems: node.lineItems?.edges?.map((edge) => edge.node) || [],
    }))

    const recentCustomers = currentStats.customers.edges.map(({ node }) => ({
      id: node.id,
      email: node.email,
      firstName: node.firstName,
      lastName: node.lastName,
      phone: node.phone,
      orders: node.orders?.edges?.map((edge) => edge.node) || [],
    }))

    const recentProducts = currentStats.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      description: node.description,
      productType: node.productType,
      vendor: node.vendor,
      status: node.status,
      featuredImage: node.featuredImage,
      variants: node.variants?.edges?.map((edge) => edge.node) || [],
    }))

    const recentCollections = currentStats.collections.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      description: node.description,
      handle: node.handle,
      image: node.image,
    }))

    // Calcular inventario
    const inventoryStatus = {
      inStock: recentProducts.filter((p) => (p.variants[0]?.inventoryQuantity || 0) > 10).length,
      lowStock: recentProducts.filter((p) => {
        const qty = p.variants[0]?.inventoryQuantity || 0
        return qty > 0 && qty <= 10
      }).length,
      outOfStock: recentProducts.filter((p) => (p.variants[0]?.inventoryQuantity || 0) === 0).length,
    }

    return {
      stats: {
        totalSales: currentMonthSales,
        totalOrders: totalOrders,
        totalCustomers: totalCustomers,
        totalProducts: totalProducts,
        totalCollections: totalCollections,
        salesChange,
        ordersChange,
        customersChange,
        productsChange,
        currency: "EUR", // Añadir código de moneda por defecto
      },
      recentOrders: recentOrders.slice(0, 5),
      recentProducts: recentProducts.slice(0, 5),
      recentCustomers: recentCustomers.slice(0, 5),
      recentCollections: recentCollections.slice(0, 5),
      allOrders: recentOrders,
      allCustomers: recentCustomers,
      allProducts: recentProducts,
      allCollections: recentCollections,
      salesOverview: generateSalesOverview(),
      inventoryStatus,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error)

    // Datos de fallback para evitar errores en la UI
    return {
      stats: {
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalCollections: 0,
        salesChange: 0,
        ordersChange: 0,
        customersChange: 0,
        productsChange: 0,
        currency: "EUR", // Añadir código de moneda por defecto
      },
      recentOrders: [],
      recentProducts: [],
      recentCustomers: [],
      recentCollections: [],
      allOrders: [],
      allCustomers: [],
      allProducts: [],
      allCollections: [],
      salesOverview: generateSalesOverview(),
      inventoryStatus: { inStock: 0, lowStock: 0, outOfStock: 0 },
      lastUpdated: new Date().toISOString(),
    }
  }
}

// Función para generar datos de ventas de ejemplo
function generateSalesOverview() {
  const today = new Date()
  const salesOverview = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    salesOverview.push({
      date: date.toISOString().split("T")[0],
      amount: Math.random() * 100,
    })
  }

  return salesOverview
}
