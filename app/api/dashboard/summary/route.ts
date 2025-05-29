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

    // Query GraphQL muy simple
    const query = `
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              status
            }
          }
        }
        orders(first: 10) {
          edges {
            node {
              id
              name
            }
          }
        }
        customers(first: 10) {
          edges {
            node {
              id
              email
            }
          }
        }
        collections(first: 10) {
          edges {
            node {
              id
              title
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

    const dashboardData = {
      stats: {
        totalSales: "0.00",
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalCollections: collections.length,
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
      allProducts: products.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        status: edge.node.status,
      })),
      allOrders: orders.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
      })),
      allCustomers: customers.map((edge: any) => ({
        id: edge.node.id,
        email: edge.node.email,
      })),
      allCollections: collections.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
      })),
      lastUpdated: new Date().toISOString(),
    }

    console.log("✅ Dashboard summary generated successfully")
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
