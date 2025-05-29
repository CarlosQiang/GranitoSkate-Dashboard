import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("📊 Fetching dashboard summary...")

    // Verificar configuración de Shopify
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Shopify credentials missing")
      return NextResponse.json({ error: "Shopify configuration missing" }, { status: 500 })
    }

    // Query GraphQL simplificada que funciona correctamente
    const query = `
      query DashboardSummary {
        orders(first: 250) {
          edges {
            node {
              id
              name
              processedAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                displayName
                email
              }
            }
          }
        }
        products(first: 250) {
          edges {
            node {
              id
              title
              handle
              status
              createdAt
              totalInventory
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
        customers(first: 250) {
          edges {
            node {
              id
              email
              firstName
              lastName
              createdAt
            }
          }
        }
        collections(first: 100) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      },
    )

    if (!response.ok) {
      console.error(`❌ Shopify API error: ${response.status}`)
      const errorText = await response.text()
      console.error("Error details:", errorText)
      return NextResponse.json({ error: `Shopify API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ GraphQL errors:", data.errors)
      return NextResponse.json({ error: "GraphQL query failed", details: data.errors }, { status: 400 })
    }

    // Procesar datos para el dashboard
    const orders = data.data?.orders?.edges || []
    const products = data.data?.products?.edges || []
    const customers = data.data?.customers?.edges || []
    const collections = data.data?.collections?.edges || []

    console.log(
      `📊 Datos obtenidos: ${orders.length} pedidos, ${products.length} productos, ${customers.length} clientes, ${collections.length} colecciones`,
    )

    // Calcular estadísticas
    const totalSales = orders.reduce((sum: number, edge: any) => {
      const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")
      return sum + amount
    }, 0)

    const totalOrders = orders.length
    const totalProducts = products.length
    const totalCustomers = customers.length
    const totalCollections = collections.length

    // Pedidos recientes (últimos 5)
    const recentOrders = orders.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      total: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
      currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: edge.node.customer?.displayName || edge.node.customer?.email || "Cliente anónimo",
    }))

    // Productos recientes (últimos 5)
    const recentProducts = products.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      status: edge.node.status,
      createdAt: edge.node.createdAt,
      price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
      inventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
    }))

    // Clientes recientes (últimos 5)
    const recentCustomers = customers.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      email: edge.node.email,
      firstName: edge.node.firstName,
      lastName: edge.node.lastName,
      createdAt: edge.node.createdAt,
    }))

    // Colecciones recientes (últimas 5)
    const recentCollections = collections.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
    }))

    // Todos los datos para sincronización
    const allOrders = orders.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      total: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
      currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: edge.node.customer,
    }))

    const allProducts = products.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      status: edge.node.status,
      createdAt: edge.node.createdAt,
      price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
      inventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
      variants: edge.node.variants?.edges?.map((variant: any) => variant.node) || [],
    }))

    const allCustomers = customers.map((edge: any) => ({
      id: edge.node.id,
      email: edge.node.email,
      firstName: edge.node.firstName,
      lastName: edge.node.lastName,
      createdAt: edge.node.createdAt,
    }))

    const allCollections = collections.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
    }))

    // Datos para gráficos de ventas (últimos 7 días)
    const salesOverview = generateSalesOverview(orders)

    const dashboardData = {
      stats: {
        totalSales: totalSales.toFixed(2),
        totalOrders,
        totalCustomers,
        totalProducts,
        totalCollections,
        currency: "EUR",
      },
      recentOrders,
      recentProducts,
      recentCustomers,
      recentCollections,
      allOrders,
      allProducts,
      allCustomers,
      allCollections,
      salesOverview,
      inventoryStatus: {
        inStock: products.filter((edge: any) => (edge.node.totalInventory || 0) > 0).length,
        lowStock: products.filter((edge: any) => {
          const inventory = edge.node.totalInventory || 0
          return inventory > 0 && inventory <= 10
        }).length,
        outOfStock: products.filter((edge: any) => (edge.node.totalInventory || 0) === 0).length,
      },
      lastUpdated: new Date().toISOString(),
    }

    console.log("✅ Dashboard summary generated successfully")
    console.log(
      `📊 Estadísticas: ${totalProducts} productos, ${totalCustomers} clientes, ${totalOrders} pedidos, ${totalCollections} colecciones`,
    )

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("❌ Error generating dashboard summary:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function generateSalesOverview(orders: any[]) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split("T")[0],
      sales: 0,
      orders: 0,
    }
  }).reverse()

  orders.forEach((edge: any) => {
    const orderDate = new Date(edge.node.processedAt).toISOString().split("T")[0]
    const dayData = last7Days.find((day) => day.date === orderDate)
    if (dayData) {
      dayData.sales += Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")
      dayData.orders += 1
    }
  })

  return last7Days
}
