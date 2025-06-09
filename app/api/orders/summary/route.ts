import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"

export async function GET() {
  try {
    console.log("🔍 Fetching orders summary from Shopify...")

    // Consulta GraphQL mejorada para obtener pedidos
    const query = `
      query GetOrdersSummary {
        orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              createdAt
              displayFulfillmentStatus
              displayFinancialStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                firstName
                lastName
                email
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      price
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      console.error("❌ GraphQL errors:", response.errors)
      throw new Error(`GraphQL Error: ${response.errors.map((e) => e.message).join(", ")}`)
    }

    if (!response.data || !response.data.orders) {
      console.error("❌ No orders data received")
      throw new Error("No se recibieron datos de pedidos de Shopify")
    }

    const orders = response.data.orders.edges.map(({ node }) => {
      const totalPrice = Number.parseFloat(node.totalPriceSet?.shopMoney?.amount || "0")

      return {
        id: node.id.split("/").pop(),
        name: node.name,
        processedAt: node.processedAt || node.createdAt,
        financialStatus: node.displayFinancialStatus || "PENDING",
        fulfillmentStatus: node.displayFulfillmentStatus || "UNFULFILLED",
        totalPrice: totalPrice.toFixed(2),
        currencyCode: node.totalPriceSet?.shopMoney?.currencyCode || "EUR",
        customer: node.customer
          ? {
              id: node.customer.id.split("/").pop(),
              firstName: node.customer.firstName || "",
              lastName: node.customer.lastName || "",
              email: node.customer.email || "",
            }
          : null,
        items:
          node.lineItems?.edges?.map((item) => ({
            title: item.node.title,
            quantity: item.node.quantity,
            price: item.node.variant?.price || "0.00",
            productTitle: item.node.variant?.product?.title || "",
          })) || [],
      }
    })

    console.log(`✅ Successfully processed ${orders.length} orders`)

    // Calcular estadísticas
    const totalOrders = orders.length
    const totalValue = orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice), 0)
    const pendingOrders = orders.filter(
      (order) => order.financialStatus === "PENDING" || order.fulfillmentStatus === "UNFULFILLED",
    ).length
    const fulfilledOrders = orders.filter((order) => order.fulfillmentStatus === "FULFILLED").length

    // Agrupar por estado financiero
    const byFinancialStatus = orders.reduce((acc, order) => {
      const status = order.financialStatus
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Agrupar por estado de cumplimiento
    const byFulfillmentStatus = orders.reduce((acc, order) => {
      const status = order.fulfillmentStatus
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const stats = {
      totalOrders,
      totalValue: totalValue.toFixed(2),
      pendingOrders,
      fulfilledOrders,
      currency: "EUR",
    }

    const result = {
      success: true,
      data: {
        stats,
        orders,
        recentOrders: orders.slice(0, 10),
        byFinancialStatus,
        byFulfillmentStatus,
      },
    }

    console.log("📊 Orders summary:", {
      totalOrders: stats.totalOrders,
      totalValue: stats.totalValue,
      pendingOrders: stats.pendingOrders,
      fulfilledOrders: stats.fulfilledOrders,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Error fetching orders summary:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al obtener pedidos",
        data: {
          stats: {
            totalOrders: 0,
            totalValue: "0.00",
            pendingOrders: 0,
            fulfilledOrders: 0,
            currency: "EUR",
          },
          orders: [],
          recentOrders: [],
          byFinancialStatus: {},
          byFulfillmentStatus: {},
        },
      },
      { status: 500 },
    )
  }
}
