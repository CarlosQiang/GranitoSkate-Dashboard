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

    // Query GraphQL más completa para obtener datos detallados
    const query = `
      query {
        products(first: 50, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
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
        orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
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
              lineItems(first: 3) {
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
        customers(first: 50, sortKey: CREATED_AT, reverse: true) {
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
        collections(first: 50, sortKey: UPDATED_AT, reverse: true) {
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
        error: `Shopify API error: ${response.status}`,
      })
    }

    const data = await response.json()

    if (data.errors) {
      console.error("❌ GraphQL errors:", data.errors)
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
        error: "GraphQL query failed",
      })
    }

    // Procesar datos de forma segura
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

    const totalInventory = products.reduce((sum: number, edge: any) => {
      return sum + (edge.node.totalInventory || 0)
    }, 0)

    // Productos recientes (últimos 5)
    const recentProducts = products.slice(0, 5).map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.title.toLowerCase().replace(/\s+/g, "-"),
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
      allProducts: products.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        status: edge.node.status,
        image: edge.node.images?.edges?.[0]?.node?.url || null,
        price: edge.node.variants?.edges?.[0]?.node?.price || "0.00",
        inventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
        productType: edge.node.productType || "SKATEBOARD",
        vendor: edge.node.vendor || "GranitoSkate",
      })),
      allOrders: orders.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        processedAt: edge.node.processedAt || edge.node.createdAt,
        total: edge.node.totalPriceSet?.shopMoney?.amount || "0.00",
        currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
        customer: edge.node.customer,
        items: edge.node.lineItems?.edges?.map((item: any) => item.node) || [],
      })),
      allCustomers: customers.map((edge: any) => ({
        id: edge.node.id,
        email: edge.node.email,
        firstName: edge.node.firstName,
        lastName: edge.node.lastName,
        phone: edge.node.phone,
        createdAt: edge.node.createdAt,
      })),
      allCollections: collections.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description,
        image: edge.node.image,
      })),
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
