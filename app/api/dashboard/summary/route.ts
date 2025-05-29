import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("📊 Fetching dashboard summary...")

    // Verificar configuración de Shopify
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Shopify credentials missing")
      return NextResponse.json({ error: "Shopify configuration missing" }, { status: 500 })
    }

    // Query GraphQL simplificada para evitar errores 400
    const query = `
      query {
        products(first: 100, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              status
              totalInventory
              productType
              vendor
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
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
        orders(first: 100) {
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
            }
          }
        }
        customers(first: 100) {
          edges {
            node {
              id
              email
              firstName
              lastName
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

    console.log("🔍 Enviando consulta GraphQL a Shopify:", query)

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
      console.error("Error response:", errorText)
      return NextResponse.json(
        {
          error: `Shopify API error: ${response.status}`,
          details: errorText,
          stats: {
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            totalCollections: 0,
            totalInventory: 0,
            currency: "EUR",
          },
        },
        { status: 200 },
      ) // Devolvemos 200 con datos de fallback para que la UI no falle
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ GraphQL errors:", data.errors)
      return NextResponse.json(
        {
          error: "GraphQL query failed",
          details: data.errors,
          stats: {
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            totalCollections: 0,
            totalInventory: 0,
            currency: "EUR",
          },
        },
        { status: 200 },
      ) // Devolvemos 200 con datos de fallback para que la UI no falle
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

    // Calcular inventario total
    const totalInventory = products.reduce((sum: number, edge: any) => {
      return sum + (edge.node.totalInventory || 0)
    }, 0)

    // Pedidos recientes (últimos 5)
    const recentOrders = orders.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt,
      total: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
      currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
    }))

    // Productos recientes (últimos 5)
    const recentProducts = products.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      status: edge.node.status,
      image: edge.node.images?.edges?.[0]?.node?.url || null,
      price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
      inventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
      productType: edge.node.productType,
      vendor: edge.node.vendor,
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
        totalInventory,
        currency: "EUR",
      },
      recentOrders,
      recentProducts,
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
      // Añadir datos completos para sincronización
      allProducts: products.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        status: edge.node.status,
        image: edge.node.images?.edges?.[0]?.node?.url || null,
        price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
        inventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
        productType: edge.node.productType,
        vendor: edge.node.vendor,
      })),
      allOrders: orders.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        processedAt: edge.node.processedAt,
        total: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
        currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      })),
      allCustomers: customers.map((edge: any) => ({
        id: edge.node.id,
        email: edge.node.email,
        firstName: edge.node.firstName,
        lastName: edge.node.lastName,
      })),
      allCollections: collections.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
      })),
    }

    console.log("✅ Dashboard summary generated successfully")
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("❌ Error generating dashboard summary:", error)
    // Devolver un objeto con estructura válida para evitar errores en el cliente
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        stats: {
          totalSales: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalCollections: 0,
          totalInventory: 0,
          currency: "EUR",
        },
        recentOrders: [],
        recentProducts: [],
        salesOverview: [],
        inventoryStatus: {
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
        },
        allProducts: [],
        allOrders: [],
        allCustomers: [],
        allCollections: [],
      },
      { status: 200 }, // Devolvemos 200 con datos de fallback para que la UI no falle
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
