import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("📊 Fetching dashboard summary...")

    // Verificar configuración de Shopify
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Shopify credentials missing")
      return NextResponse.json({
        stats: {
          totalSales: "0.00",
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
        error: "Shopify configuration missing",
      })
    }

    // Consulta para obtener productos
    const productsQuery = `
      query {
        products(first: 100, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              handle
              status
              createdAt
              updatedAt
              productType
              vendor
              totalInventory
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
      }
    `

    console.log("🔍 Fetching products from Shopify...")
    const productsResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: productsQuery }),
      },
    )

    if (!productsResponse.ok) {
      console.error(`❌ Shopify API error (products): ${productsResponse.status}`)
      throw new Error(`Shopify API error: ${productsResponse.status}`)
    }

    const productsData = await productsResponse.json()
    const products = productsData.data?.products?.edges || []
    console.log(`✅ Fetched ${products.length} products`)

    // Consulta para obtener pedidos
    const ordersQuery = `
      query {
        orders(first: 100, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              createdAt
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
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `

    console.log("🔍 Fetching orders from Shopify...")
    const ordersResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: ordersQuery }),
      },
    )

    if (!ordersResponse.ok) {
      console.error(`❌ Shopify API error (orders): ${ordersResponse.status}`)
      throw new Error(`Shopify API error: ${ordersResponse.status}`)
    }

    const ordersData = await ordersResponse.json()
    const orders = ordersData.data?.orders?.edges || []
    console.log(`✅ Fetched ${orders.length} orders`)

    // Consulta para obtener clientes y colecciones
    const otherDataQuery = `
      query {
        customers(first: 100, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              email
              firstName
              lastName
              createdAt
              phone
            }
          }
        }
        collections(first: 100, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              handle
              description
              updatedAt
              image {
                url
              }
            }
          }
        }
      }
    `

    console.log("🔍 Fetching customers and collections from Shopify...")
    const otherDataResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: otherDataQuery }),
      },
    )

    if (!otherDataResponse.ok) {
      console.error(`❌ Shopify API error (other data): ${otherDataResponse.status}`)
      throw new Error(`Shopify API error: ${otherDataResponse.status}`)
    }

    const otherData = await otherDataResponse.json()
    const customers = otherData.data?.customers?.edges || []
    const collections = otherData.data?.collections?.edges || []
    console.log(`✅ Fetched ${customers.length} customers and ${collections.length} collections`)

    // Procesar datos
    console.log("🔄 Processing dashboard data...")

    // Calcular estadísticas
    const totalSales = orders.reduce((sum: number, edge: any) => {
      const amount = Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")
      return sum + amount
    }, 0)

    const totalInventory = products.reduce((sum: number, edge: any) => {
      return sum + (edge.node.totalInventory || 0)
    }, 0)

    // Productos recientes (últimos 5)
    const recentProducts = products.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle || edge.node.title.toLowerCase().replace(/\s+/g, "-"),
      status: edge.node.status,
      createdAt: edge.node.createdAt,
      image: edge.node.images?.edges?.[0]?.node?.url || null,
      price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
      inventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
      productType: edge.node.productType || "SKATEBOARD",
      vendor: edge.node.vendor || "GranitoSkate",
    }))

    // Pedidos recientes (últimos 5)
    const recentOrders = orders.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt || edge.node.createdAt,
      total: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
      currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: edge.node.customer?.displayName || edge.node.customer?.email || "Cliente anónimo",
      items:
        edge.node.lineItems?.edges?.map((item: any) => ({
          title: item.node.title,
          quantity: item.node.quantity,
        })) || [],
    }))

    // Estado del inventario
    const inventoryStatus = {
      inStock: products.filter((edge: any) => (edge.node.totalInventory || 0) > 10).length,
      lowStock: products.filter((edge: any) => {
        const inventory = edge.node.totalInventory || 0
        return inventory > 0 && inventory <= 10
      }).length,
      outOfStock: products.filter((edge: any) => (edge.node.totalInventory || 0) === 0).length,
    }

    // Generar datos de ventas para los últimos 7 días
    const salesOverview = generateSalesOverview(orders)

    // Preparar datos completos para sincronización
    const allProducts = products.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle || edge.node.title.toLowerCase().replace(/\s+/g, "-"),
      status: edge.node.status,
      createdAt: edge.node.createdAt,
      updatedAt: edge.node.updatedAt,
      image: edge.node.images?.edges?.[0]?.node?.url || null,
      price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
      inventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
      totalInventory: edge.node.totalInventory || 0,
      productType: edge.node.productType || "SKATEBOARD",
      vendor: edge.node.vendor || "GranitoSkate",
    }))

    const allOrders = orders.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      processedAt: edge.node.processedAt || edge.node.createdAt,
      createdAt: edge.node.createdAt,
      total: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
      currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
      customer: {
        displayName: edge.node.customer?.displayName || "Cliente anónimo",
        email: edge.node.customer?.email || "",
      },
      items:
        edge.node.lineItems?.edges?.map((item: any) => ({
          title: item.node.title,
          quantity: item.node.quantity,
        })) || [],
    }))

    const allCustomers = customers.map((edge: any) => ({
      id: edge.node.id,
      email: edge.node.email,
      firstName: edge.node.firstName,
      lastName: edge.node.lastName,
      phone: edge.node.phone,
      createdAt: edge.node.createdAt,
    }))

    const allCollections = collections.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      updatedAt: edge.node.updatedAt,
      image: edge.node.image?.url || null,
    }))

    const dashboardData = {
      stats: {
        totalSales: totalSales.toFixed(2),
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalCollections: collections.length,
        totalInventory,
        currency: "EUR",
      },
      recentOrders,
      recentProducts,
      salesOverview,
      inventoryStatus,
      allProducts,
      allOrders,
      allCustomers,
      allCollections,
      lastUpdated: new Date().toISOString(),
    }

    console.log("✅ Dashboard summary generated successfully")
    console.log(`📊 Productos recientes: ${recentProducts.length}, Pedidos recientes: ${recentOrders.length}`)

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("❌ Error generating dashboard summary:", error)
    return NextResponse.json({
      stats: {
        totalSales: "0.00",
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
      error: "Internal server error",
    })
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
    const orderDate = new Date(edge.node.processedAt || edge.node.createdAt).toISOString().split("T")[0]
    const dayData = last7Days.find((day) => day.date === orderDate)
    if (dayData) {
      dayData.sales += Number.parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || "0")
      dayData.orders += 1
    }
  })

  return last7Days
}
