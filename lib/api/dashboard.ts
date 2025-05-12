import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function fetchDashboardStats() {
  try {
    // Consulta para obtener estadísticas básicas de la tienda
    const query = gql`
      query {
        shop {
          name
          myshopifyDomain
          primaryDomain {
            url
          }
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
    let totalRevenue = 0
    if (data?.orders?.edges) {
      totalRevenue = data.orders.edges.reduce((sum, order) => {
        const amount = Number.parseFloat(order.node.totalPriceSet?.shopMoney?.amount || "0")
        return sum + amount
      }, 0)
    }

    return {
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
      shopName: data?.shop?.name || "",
      shopDomain: data?.shop?.myshopifyDomain || "",
      shopUrl: data?.shop?.primaryDomain?.url || "",
    }
  } catch (error) {
    console.error("Error fetching shop stats:", error)
    throw new Error(`Error al cargar estadísticas: ${error.message}`)
  }
}

export async function fetchShopStats() {
  return fetchDashboardStats()
}
